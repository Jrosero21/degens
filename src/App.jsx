import React, { useEffect, useMemo, useState } from "react";

const BOARD_PATH = "/data/current-board.json";
const PROJECT_TIMEZONE = "America/New_York";
const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "live", label: "Live" },
  { key: "final", label: "Final" },
];

function formatDateTime(value) {
  if (!value) {
    return "TBD";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  });
}

function formatDateLabel(value) {
  if (!value) {
    return "Today";
  }
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) {
    return "Today";
  }
  const date = new Date(`${year}-${month}-${day}T12:00:00Z`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: PROJECT_TIMEZONE,
  });
}

function formatPercent(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }
  return `${(value * 100).toFixed(1)}%`;
}

function formatSpread(favorite, spread) {
  if (!favorite || typeof spread !== "number" || Number.isNaN(spread)) {
    return "No line";
  }
  return `${favorite} ${spread > 0 ? "+" : ""}${spread.toFixed(1)}`;
}

function formatTotal(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }
  return value.toFixed(1);
}

function formatPredictedWinner(prediction) {
  if (!prediction?.winner) {
    return "No prediction";
  }
  const margin = typeof prediction.margin === "number" ? ` by ${prediction.margin}` : "";
  return `${prediction.winner}${margin}`;
}

function formatBetCategory(value, fallback = "--") {
  if (!value) {
    return fallback;
  }
  if (value === "dnc") {
    return "Failed to cover";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function scoreValue(value) {
  return typeof value === "number" ? value : "--";
}

function statusTone(status) {
  if (status === "live") {
    return "is-live";
  }
  if (status === "final") {
    return "is-final";
  }
  return "is-scheduled";
}

function dateKeyWithOffset(dayOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function pickSlateDate(games) {
  const today = dateKeyWithOffset(0);
  const todayGames = games.filter((game) => game.gameDate === today);
  if (todayGames.length) {
    return today;
  }
  const datedGames = games.map((game) => game.gameDate).filter(Boolean).sort();
  return datedGames.at(-1) ?? today;
}

function pickAlternateSlateDate(games, primaryDate) {
  const tomorrow = dateKeyWithOffset(1);
  if (primaryDate !== tomorrow && games.some((game) => game.gameDate === tomorrow)) {
    return tomorrow;
  }
  const today = dateKeyWithOffset(0);
  if (primaryDate !== today && games.some((game) => game.gameDate === today)) {
    return today;
  }
  return primaryDate;
}

function App() {
  const [board, setBoard] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [filterMode, setFilterMode] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadBoard() {
      const response = await fetch(BOARD_PATH, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load board (${response.status})`);
      }
      const payload = await response.json();
      if (!active) {
        return;
      }
      setBoard(payload);
    }

    loadBoard().catch((error) => {
      if (active) {
        setBoard({ error: error.message, games: [], modelAccuracy: [], meta: {}, summary: {} });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const allGames = board?.games ?? [];
  const defaultSlateDate = useMemo(() => pickSlateDate(allGames), [allGames]);
  const alternateSlateDate = useMemo(() => pickAlternateSlateDate(allGames, defaultSlateDate), [allGames, defaultSlateDate]);
  const focusDates = useMemo(() => {
    return Array.from(new Set([defaultSlateDate, alternateSlateDate].filter(Boolean)));
  }, [alternateSlateDate, defaultSlateDate]);

  const focusGames = useMemo(() => {
    return allGames.filter((game) => focusDates.includes(game.gameDate));
  }, [allGames, focusDates]);

  const todayGames = useMemo(() => {
    return focusGames.filter((game) => game.gameDate === defaultSlateDate);
  }, [defaultSlateDate, focusGames]);

  const tomorrowGames = useMemo(() => {
    if (!alternateSlateDate || alternateSlateDate === defaultSlateDate) {
      return [];
    }
    return focusGames.filter((game) => game.gameDate === alternateSlateDate);
  }, [alternateSlateDate, defaultSlateDate, focusGames]);

  const filteredGames = useMemo(() => {
    if (filterMode === "today") {
      return todayGames;
    }
    if (filterMode === "tomorrow") {
      return tomorrowGames;
    }
    if (filterMode === "live") {
      return focusGames.filter((game) => game.status === "live");
    }
    if (filterMode === "final") {
      return focusGames.filter((game) => game.status === "final");
    }
    return focusGames;
  }, [filterMode, focusGames, todayGames, tomorrowGames]);

  useEffect(() => {
    if (!filteredGames.length) {
      setSelectedGameId(null);
      return;
    }
    setSelectedGameId((current) => {
      if (current && filteredGames.some((game) => game.id === current)) {
        return current;
      }
      return filteredGames[0].id;
    });
  }, [filteredGames]);

  const outcomeAccuracy = board?.modelOutcomeAccuracy ?? {};
  const filterCounts = {
    all: focusGames.length,
    today: todayGames.length,
    tomorrow: tomorrowGames.length,
    live: focusGames.filter((game) => game.status === "live").length,
    final: focusGames.filter((game) => game.status === "final").length,
  };

  return (
    <div className="app-shell">
      <main className="app-frame">
        <header className="topbar">
          <div className="topbar-brand">
            <img className="topbar-logo" src="/delly.png" alt="Delly" />
            <div>
              <div className="eyebrow">March Madness</div>
              <h1>Tournament board</h1>
              <p>
                {formatDateLabel(defaultSlateDate)} and {formatDateLabel(alternateSlateDate)} in ET with live status and pregame projections.
              </p>
            </div>
          </div>

          <div className="topbar-meta">
            <div className="meta-chip">{board?.meta?.activeModel ?? "No active model"}</div>
            <div className="meta-chip">Updated {formatDateTime(board?.meta?.updatedAt)}</div>
          </div>
        </header>

        <section className="accuracy-strip">
          <article className="accuracy-card-large">
            <div className="accuracy-card-head">
              <span>Model Accuracy So Far</span>
              <strong>{formatPercent(outcomeAccuracy.winnerAccuracy)}</strong>
            </div>
            <div className="accuracy-metric-grid">
              <div className="accuracy-mini">
                <span>Winner</span>
                <strong>{formatPercent(outcomeAccuracy.winnerAccuracy)}</strong>
              </div>
              <div className="accuracy-mini">
                <span>Favor Cover</span>
                <strong>{formatPercent(outcomeAccuracy.coverAccuracy)}</strong>
              </div>
              <div className="accuracy-mini">
                <span>Favor Failed To Cover</span>
                <strong>{formatPercent(outcomeAccuracy.dncAccuracy)}</strong>
              </div>
              <div className="accuracy-mini">
                <span>Over</span>
                <strong>{formatPercent(outcomeAccuracy.overAccuracy)}</strong>
              </div>
              <div className="accuracy-mini">
                <span>Under</span>
                <strong>{formatPercent(outcomeAccuracy.underAccuracy)}</strong>
              </div>
            </div>
            <div className="accuracy-card-foot">
                <span>
                  {typeof outcomeAccuracy.finalizedGames === "number"
                    ? `${outcomeAccuracy.finalizedGames} finalized games`
                    : "No finalized games yet"}
                </span>
                <span>
                  {typeof outcomeAccuracy.coverPicks === "number" &&
                  typeof outcomeAccuracy.dncPicks === "number" &&
                  typeof outcomeAccuracy.overPicks === "number" &&
                  typeof outcomeAccuracy.underPicks === "number"
                    ? `${outcomeAccuracy.coverPicks} cover • ${outcomeAccuracy.dncPicks} dnc • ${outcomeAccuracy.overPicks} over • ${outcomeAccuracy.underPicks} under`
                    : ""}
                </span>
              </div>
          </article>
          <div className="market-note">Market spread and total are averages across multiple bookmakers.</div>
        </section>

        <section className="board-shell">
          <div className="left-column">
            <section className="controls-bar">
              <div className="chip-row chip-row-scroll">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    className={`chip chip-with-badge ${filterMode === option.key ? "is-active" : ""}`}
                    onClick={() => setFilterMode(option.key)}
                  >
                    <span>{option.label}</span>
                    <span className="chip-badge">{filterCounts[option.key] ?? 0}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="games-list">
              {filteredGames.map((game) => {
                const expanded = selectedGameId === game.id;
                return (
                  <button
                    key={game.id}
                    className={`game-row ${expanded ? "is-selected" : ""}`}
                    onClick={() => setSelectedGameId((current) => (current === game.id ? null : game.id))}
                  >
                    <div className="game-row-head">
                      <div>
                        <div className="game-row-title">{game.team1?.name} vs {game.team2?.name}</div>
                        <div className="game-row-meta">
                          {game.roundLabel} • {game.gameSlot} • {formatDateTime(game.tipoff)}
                        </div>
                      </div>
                      <span className={`status-pill ${statusTone(game.status)}`}>{game.status}</span>
                    </div>

                    <div className="teams-grid">
                      {[game.team1, game.team2].map((team) => (
                        <div key={team.side} className="team-line">
                          <div className="team-line-left">
                            <span className="seed-pill">{team.seed ?? "-"}</span>
                            <span className="team-name">{team.name}</span>
                          </div>
                          <div className="team-line-right">
                            <span className="pred-pill">P {typeof team.predScore === "number" ? team.predScore : "--"}</span>
                            <strong>{scoreValue(team.score)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="game-row-foot">
                      <span>{formatSpread(game.odds?.favoriteTeam, game.odds?.favoriteSpread)}</span>
                      <span className="game-row-foot-note">
                        Market spread and total are averages across multiple bookmakers.
                      </span>
                      <span>{formatPredictedWinner(game.prediction)}</span>
                    </div>

                    {expanded ? (
                      <div className="expand-panel">
                        <div className="expand-grid">
                          <div>
                            <span>Projected Cover</span>
                            <strong>{formatBetCategory(game.prediction?.projectedCover)}</strong>
                          </div>
                          <div>
                            <span>Projected O/U</span>
                            <strong>{formatBetCategory(game.prediction?.projectedOu)}</strong>
                          </div>
                          <div>
                            <span>Actual Cover</span>
                            <strong>{formatBetCategory(game.prediction?.actualCover)}</strong>
                          </div>
                          <div>
                            <span>Actual O/U</span>
                            <strong>{formatBetCategory(game.prediction?.actualOu)}</strong>
                          </div>
                          <div>
                            <span>Market Spread</span>
                            <strong>{formatSpread(game.odds?.favoriteTeam, game.odds?.favoriteSpread)}</strong>
                          </div>
                          <div>
                            <span>Market Total</span>
                            <strong>{formatTotal(game.odds?.total)}</strong>
                          </div>
                          <div>
                            <span>Projected Winner</span>
                            <strong>{formatPredictedWinner(game.prediction)}</strong>
                          </div>
                          <div>
                            <span>Projected Total</span>
                            <strong>{formatTotal(game.prediction?.total)}</strong>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </button>
                );
              })}

              {!filteredGames.length ? <div className="empty-state">No games match the current filter.</div> : null}
            </section>
          </div>
        </section>

        {board?.error ? <div className="error-banner">{board.error}</div> : null}
      </main>
    </div>
  );
}

export default App;
