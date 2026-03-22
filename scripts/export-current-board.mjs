import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const outputPath = path.join(appRoot, "public", "data", "current-board.json");

function parseEnv(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    const raw = trimmed.slice(idx + 1).trim();
    out[key] = raw.replace(/^['"]|['"]$/g, "");
  }
  return out;
}

async function loadEnvFile(envPath) {
  try {
    const content = await fs.readFile(envPath, "utf8");
    return parseEnv(content);
  } catch {
    return {};
  }
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function latestTimestamp(values) {
  let latest = null;
  for (const value of values) {
    if (!value) {
      continue;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      continue;
    }
    if (!latest || date > latest) {
      latest = date;
    }
  }
  return latest ? latest.toISOString() : new Date().toISOString();
}

function niceRoundLabel(round) {
  const labels = {
    first_four: "First Four",
    round64: "Round of 64",
    round32: "Round of 32",
    sweet16: "Sweet 16",
    elite8: "Elite 8",
    final4: "Final Four",
    title: "National Championship",
  };
  return labels[round] ?? round ?? "Unknown Round";
}

function buildBoardPayload(games, modelAccuracy, modelOutcomeAccuracy) {
  const summary = {
    totalGames: games.length,
    scheduledGames: games.filter((game) => game.status === "scheduled").length,
    liveGames: games.filter((game) => game.status === "live").length,
    finalGames: games.filter((game) => game.status === "final").length,
  };

  const updatedAt = latestTimestamp(
    games.flatMap((game) => [game.odds?.snapshotAt, game.prediction?.runAt, game.scoreLastSyncAt, game.tipoff]),
  );

  const activeModel =
    games.find((game) => game.prediction?.modelVersion)?.prediction?.modelVersion ?? "score_v2_blend";

  return {
    meta: {
      title: "March Madness Reference Board",
      seasonLabel: "2026 NCAA Tournament",
      activeModel,
      refreshCadence: "Daily schedule and odds, recurring live scores",
      updatedAt,
    },
    summary,
    modelAccuracy,
    modelOutcomeAccuracy,
    games,
  };
}

async function main() {
  const repoEnv = await loadEnvFile(path.join(repoRoot, ".env"));
  const localEnv = await loadEnvFile(path.join(appRoot, ".env.local"));
  const env = { ...repoEnv, ...localEnv, ...process.env };

  const connection = await mysql.createConnection({
    host: env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(env.MYSQL_PORT ?? 3307),
    user: env.MYSQL_USER ?? "jonnyrosero_mlb",
    password: env.MYSQL_PWD,
    database: env.MYSQL_DB ?? "jonnyrosero_march_madness",
  });

  try {
    const [gameRows] = await connection.query(`
      SELECT
        game_slot,
        DATE_FORMAT(game_date, '%Y-%m-%d') AS game_date_key,
        round_name,
        game_status,
        scheduled_tipoff_et,
        venue,
        team_1_name,
        team_1_seed,
        team_1_score,
        team_2_name,
        team_2_seed,
        team_2_score,
        score_last_sync_at,
        odds_snapshot_ts,
        favorite_team,
        favorite_spread,
        avg_total_points,
        active_model_version,
        active_run_ts,
        team_a_name,
        team_a_seed,
        team_a_pred_score,
        team_b_name,
        team_b_seed,
        team_b_pred_score,
        predicted_winner_team_name,
        predicted_margin,
        predicted_total,
        projected_cover,
        projected_ou,
        actual_cover,
        actual_ou
      FROM mm_v_live_board
      WHERE season = 2026
      ORDER BY round_sort, COALESCE(scheduled_tipoff_utc, scheduled_tipoff_et), game_slot
    `);

    const [accuracyRows] = await connection.query(`
      SELECT
        model_version,
        round_name,
        finalized_games,
        winner_accuracy,
        team_score_mae,
        total_points_mae
      FROM mm_v_model_accuracy_summary
      ORDER BY
        FIELD(round_name, 'first_four', 'round64', 'round32', 'sweet16', 'elite8', 'final4', 'title'),
        model_version
    `);

    const [outcomeAccuracyRows] = await connection.query(`
      SELECT
        COUNT(*) AS finalized_games,
        AVG(CASE WHEN p.predicted_winner_team_name = g.actual_winner_name THEN 1 ELSE 0 END) AS winner_accuracy,
        SUM(CASE WHEN p.projected_cover = 'cover' AND p.actual_cover IS NOT NULL THEN 1 ELSE 0 END) AS cover_picks,
        AVG(CASE WHEN p.projected_cover = 'cover' THEN CASE WHEN p.actual_cover = 'cover' THEN 1 ELSE 0 END END) AS cover_accuracy,
        SUM(CASE WHEN p.projected_cover = 'dnc' AND p.actual_cover IS NOT NULL THEN 1 ELSE 0 END) AS dnc_picks,
        AVG(CASE WHEN p.projected_cover = 'dnc' THEN CASE WHEN p.actual_cover = 'dnc' THEN 1 ELSE 0 END END) AS dnc_accuracy,
        SUM(CASE WHEN p.projected_ou = 'over' AND p.actual_ou IS NOT NULL THEN 1 ELSE 0 END) AS over_picks,
        AVG(CASE WHEN p.projected_ou = 'over' THEN CASE WHEN p.actual_ou = 'over' THEN 1 ELSE 0 END END) AS over_accuracy,
        SUM(CASE WHEN p.projected_ou = 'under' AND p.actual_ou IS NOT NULL THEN 1 ELSE 0 END) AS under_picks,
        AVG(CASE WHEN p.projected_ou = 'under' THEN CASE WHEN p.actual_ou = 'under' THEN 1 ELSE 0 END END) AS under_accuracy
      FROM mm_v_active_score_predictions p
      JOIN mm_tourney_games g
        ON p.season = g.season
       AND p.game_slot = g.game_slot
      WHERE p.season = 2026
        AND g.is_final = 1
        AND p.prediction_type = 'pregame'
    `);

    const games = gameRows.map((row) => ({
      id: row.game_slot,
      gameSlot: row.game_slot,
      gameDate: row.game_date_key,
      round: row.round_name,
      roundLabel: niceRoundLabel(row.round_name),
      status: row.game_status,
      tipoff: row.scheduled_tipoff_et,
      venue: row.venue,
      scoreLastSyncAt: row.score_last_sync_at,
      team1: {
        side: "team1",
        name: row.team_1_name,
        seed: row.team_1_seed,
        score: numberOrNull(row.team_1_score),
        predScore:
          row.team_a_name === row.team_1_name
            ? numberOrNull(row.team_a_pred_score)
            : row.team_b_name === row.team_1_name
              ? numberOrNull(row.team_b_pred_score)
              : null,
      },
      team2: {
        side: "team2",
        name: row.team_2_name,
        seed: row.team_2_seed,
        score: numberOrNull(row.team_2_score),
        predScore:
          row.team_a_name === row.team_2_name
            ? numberOrNull(row.team_a_pred_score)
            : row.team_b_name === row.team_2_name
              ? numberOrNull(row.team_b_pred_score)
              : null,
      },
      odds: {
        snapshotAt: row.odds_snapshot_ts,
        favoriteTeam: row.favorite_team,
        favoriteSpread: numberOrNull(row.favorite_spread),
        total: numberOrNull(row.avg_total_points),
      },
      prediction: {
        modelVersion: row.active_model_version,
        runAt: row.active_run_ts,
        winner: row.predicted_winner_team_name,
        margin: numberOrNull(row.predicted_margin),
        total: numberOrNull(row.predicted_total),
        projectedCover: row.projected_cover,
        projectedOu: row.projected_ou,
        actualCover: row.actual_cover,
        actualOu: row.actual_ou,
      },
    }));

    const modelAccuracy = accuracyRows.map((row) => ({
      modelVersion: row.model_version,
      round: row.round_name,
      roundLabel: niceRoundLabel(row.round_name),
      finalizedGames: numberOrNull(row.finalized_games),
      winnerAccuracy: numberOrNull(row.winner_accuracy),
      teamScoreMae: numberOrNull(row.team_score_mae),
      totalPointsMae: numberOrNull(row.total_points_mae),
    }));

    const outcomeAccuracyRow = outcomeAccuracyRows[0] ?? {};
    const modelOutcomeAccuracy = {
      finalizedGames: numberOrNull(outcomeAccuracyRow.finalized_games),
      winnerAccuracy: numberOrNull(outcomeAccuracyRow.winner_accuracy),
      coverPicks: numberOrNull(outcomeAccuracyRow.cover_picks),
      coverAccuracy: numberOrNull(outcomeAccuracyRow.cover_accuracy),
      dncPicks: numberOrNull(outcomeAccuracyRow.dnc_picks),
      dncAccuracy: numberOrNull(outcomeAccuracyRow.dnc_accuracy),
      overPicks: numberOrNull(outcomeAccuracyRow.over_picks),
      overAccuracy: numberOrNull(outcomeAccuracyRow.over_accuracy),
      underPicks: numberOrNull(outcomeAccuracyRow.under_picks),
      underAccuracy: numberOrNull(outcomeAccuracyRow.under_accuracy),
    };

    const payload = buildBoardPayload(games, modelAccuracy, modelOutcomeAccuracy);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Wrote ${games.length} games to ${outputPath}`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
