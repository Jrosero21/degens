import { useState, useMemo } from "react";

const ALEX_IMG = "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";
const DELLY_IMG = "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";

const mockGames = {
  today: [
    { id:1, sport:"NHL", time:"7:00 PM ET", away:{name:"Minnesota Wild",abbr:"MIN"}, home:{name:"Boston Bruins",abbr:"BOS"}, prediction:"BOS", confidence:61.4, edge:2.7, spread:-1.5, spreadJuice:-110, mlHome:-165, mlAway:+140, ou:5.5, tag:"go_play", tagLabel:"Go Play", note:"Strongest home favorite on the board." },
    { id:2, sport:"NHL", time:"9:30 PM ET", away:{name:"Detroit Red Wings",abbr:"DET"}, home:{name:"Colorado Avalanche",abbr:"COL"}, prediction:"DET", confidence:50.8, edge:-3.4, spread:+1.5, spreadJuice:-110, mlHome:-130, mlAway:+110, ou:6.0, tag:"stay_away", tagLabel:"Stay Away", note:"Too close / too noisy. Model fails stricter cutoff." },
    { id:3, sport:"NHL", time:"7:30 PM ET", away:{name:"New York Rangers",abbr:"NYR"}, home:{name:"Florida Panthers",abbr:"FLA"}, prediction:"FLA", confidence:67.2, edge:4.1, spread:-1.5, spreadJuice:-115, mlHome:-180, mlAway:+155, ou:5.5, tag:"value", tagLabel:"Value Play", note:"Strong model edge. Home ice advantage meaningful here." },
    { id:4, sport:"NBA", time:"8:00 PM ET", away:{name:"Phoenix Suns",abbr:"PHX"}, home:{name:"Dallas Mavericks",abbr:"DAL"}, prediction:"DAL", confidence:58.9, edge:1.8, spread:-3.5, spreadJuice:-110, mlHome:-210, mlAway:+175, ou:225.5, tag:"lean", tagLabel:"Lean", note:"Moderate edge but injury report watch." },
    { id:5, sport:"NBA", time:"10:00 PM ET", away:{name:"Memphis Grizzlies",abbr:"MEM"}, home:{name:"Golden State Warriors",abbr:"GSW"}, prediction:"GSW", confidence:64.1, edge:3.3, spread:-4.0, spreadJuice:-110, mlHome:-225, mlAway:+185, ou:228.0, tag:"value", tagLabel:"Value Play", note:"Home court + rest advantage factored in." },
    { id:6, sport:"NHL", time:"6:00 PM ET", away:{name:"Philadelphia Flyers",abbr:"PHI"}, home:{name:"Tampa Bay Lightning",abbr:"TBL"}, prediction:"TBL", confidence:71.8, edge:5.2, spread:-1.5, spreadJuice:-120, mlHome:-195, mlAway:+162, ou:5.5, tag:"strong", tagLabel:"Strong Pick", note:"High conviction. Model and line agree." },
    { id:7, sport:"NBA", time:"7:00 PM ET", away:{name:"Chicago Bulls",abbr:"CHI"}, home:{name:"Miami Heat",abbr:"MIA"}, prediction:"MIA", confidence:55.3, edge:0.9, spread:-2.5, spreadJuice:-110, mlHome:-145, mlAway:+122, ou:214.5, tag:"lean", tagLabel:"Lean", note:"Slim edge. Play only with strong bankroll discipline." },
  ],
  tomorrow: [
    { id:8, sport:"NHL", time:"7:00 PM ET", away:{name:"Ottawa Senators",abbr:"OTT"}, home:{name:"Toronto Maple Leafs",abbr:"TOR"}, prediction:"TOR", confidence:68.5, edge:3.9, spread:-1.5, spreadJuice:-115, mlHome:-185, mlAway:+155, ou:6.0, tag:"value", tagLabel:"Value Play", note:"Divisional edge. TOR dominant at home this stretch." },
    { id:9, sport:"NBA", time:"8:30 PM ET", away:{name:"Brooklyn Nets",abbr:"BKN"}, home:{name:"Milwaukee Bucks",abbr:"MIL"}, prediction:"MIL", confidence:74.2, edge:6.1, spread:-7.5, spreadJuice:-110, mlHome:-320, mlAway:+260, ou:232.0, tag:"strong", tagLabel:"Strong Pick", note:"Blowout potential. Model sees large gap in talent." },
    { id:10, sport:"NHL", time:"9:00 PM ET", away:{name:"Vegas Golden Knights",abbr:"VGK"}, home:{name:"Los Angeles Kings",abbr:"LAK"}, prediction:"VGK", confidence:52.1, edge:-1.1, spread:+1.5, spreadJuice:-110, mlHome:-120, mlAway:+100, ou:5.5, tag:"stay_away", tagLabel:"Stay Away", note:"Coin flip with juice. Model says lean only." },
    { id:11, sport:"NBA", time:"7:00 PM ET", away:{name:"Orlando Magic",abbr:"ORL"}, home:{name:"Cleveland Cavaliers",abbr:"CLE"}, prediction:"CLE", confidence:63.7, edge:3.0, spread:-4.5, spreadJuice:-110, mlHome:-215, mlAway:+178, ou:219.5, tag:"value", tagLabel:"Value Play", note:"CLE rolling. Rest edge plus home crowd factor." },
    { id:12, sport:"NHL", time:"6:30 PM ET", away:{name:"Carolina Hurricanes",abbr:"CAR"}, home:{name:"New Jersey Devils",abbr:"NJD"}, prediction:"CAR", confidence:59.4, edge:1.5, spread:+1.5, spreadJuice:-105, mlHome:-110, mlAway:-105, ou:5.5, tag:"lean", tagLabel:"Lean", note:"Road dog with some value. Low-confidence play." },
  ]
};

const tagConfig = {
  go_play:   { bg:"rgba(0,255,135,0.12)", border:"rgba(0,255,135,0.4)", text:"#00ff87", dot:"#00ff87" },
  stay_away: { bg:"rgba(255,53,71,0.12)",  border:"rgba(255,53,71,0.4)",  text:"#ff3547", dot:"#ff3547" },
  strong:    { bg:"rgba(255,193,7,0.12)",  border:"rgba(255,193,7,0.4)",  text:"#ffc107", dot:"#ffc107" },
  value:     { bg:"rgba(99,179,237,0.12)", border:"rgba(99,179,237,0.4)", text:"#63b3ed", dot:"#63b3ed" },
  lean:      { bg:"rgba(160,160,180,0.10)",border:"rgba(160,160,180,0.3)",text:"#a0a0b4", dot:"#a0a0b4" },
};

const sportColors = { NHL: "#00d4ff", NBA: "#ff8c00" };

function ConfidenceBar({ value }) {
  const color = value >= 65 ? "#00ff87" : value >= 55 ? "#ffc107" : "#ff3547";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:`${Math.min(value,100)}%`, height:"100%", background:color, borderRadius:3, transition:"width 0.6s ease" }} />
      </div>
      <span style={{ fontSize:13, fontWeight:700, color, fontFamily:"'Bebas Neue',cursive", letterSpacing:0.5, minWidth:38, textAlign:"right" }}>{value.toFixed(1)}%</span>
    </div>
  );
}

function SportBadge({ sport }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, letterSpacing:1, padding:"2px 8px", borderRadius:4, background:`${sportColors[sport]}20`, color:sportColors[sport], border:`1px solid ${sportColors[sport]}40`, fontFamily:"'Bebas Neue',cursive" }}>
      {sport}
    </span>
  );
}

function TagBadge({ tag, label }) {
  const cfg = tagConfig[tag] || tagConfig.lean;
  return (
    <span style={{ fontSize:11, fontWeight:700, letterSpacing:0.8, padding:"3px 10px", borderRadius:20, background:cfg.bg, color:cfg.text, border:`1px solid ${cfg.border}`, whiteSpace:"nowrap", fontFamily:"'Outfit',sans-serif" }}>
      {label}
    </span>
  );
}

function PickCard({ type, name, imgB64, imgType, game }) {
  const isGo = type === "go";
  const cfg = isGo ? tagConfig.go_play : tagConfig.stay_away;
  const accentColor = isGo ? "#00ff87" : "#ff3547";
  const label = isGo ? "GO PLAY" : "STAY AWAY";
  return (
    <div style={{
      flex:1, minWidth:280, position:"relative", overflow:"hidden",
      background:"linear-gradient(135deg, #0d1525 0%, #111e35 100%)",
      border:`1px solid ${cfg.border}`, borderRadius:16,
      padding:"24px 24px 20px",
      boxShadow:`0 0 40px ${accentColor}18, 0 8px 32px rgba(0,0,0,0.4)`,
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
      <div style={{ position:"absolute", top:-60, right:-60, width:180, height:180, borderRadius:"50%", background:`radial-gradient(circle, ${accentColor}12, transparent 70%)`, pointerEvents:"none" }} />
      
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:accentColor, fontFamily:"'Bebas Neue',cursive", marginBottom:12 }}>
        ◈ {label}
      </div>
      
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
        <div style={{ width:60, height:60, borderRadius:"50%", overflow:"hidden", border:`2px solid ${accentColor}60`, flexShrink:0, background:"#0a0e1a" }}>
          <img src={`data:image/${imgType};base64,${imgB64}`} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center" }} />
        </div>
        <div>
          <div style={{ fontSize:13, color:"#7a8ba8", fontFamily:"'Outfit',sans-serif" }}>Pick by</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#e2e8f4", fontFamily:"'Bebas Neue',cursive", letterSpacing:1 }}>{name}</div>
        </div>
      </div>
      
      {game ? (
        <>
          <div style={{ fontSize:28, fontWeight:900, color:"#e2e8f4", fontFamily:"'Bebas Neue',cursive", letterSpacing:1, marginBottom:4 }}>
            {game.away.abbr} <span style={{ color:"#3a4a65", fontSize:20 }}>at</span> {game.home.abbr} <SportBadge sport={game.sport} />
          </div>
          <div style={{ fontSize:13, color:"#7a8ba8", fontFamily:"'Outfit',sans-serif", marginBottom:14 }}>{game.note}</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, padding:"4px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", color:"#c5cfe0", fontFamily:"'Outfit',sans-serif" }}>
              Model {game.confidence}% • Edge {game.edge > 0 ? "+" : ""}{game.edge} pts
            </span>
            <span style={{ fontSize:12, padding:"4px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", color:"#c5cfe0", fontFamily:"'Outfit',sans-serif" }}>
              Confidence {game.confidence}%
            </span>
          </div>
        </>
      ) : (
        <div style={{ color:"#3a4a65", fontFamily:"'Outfit',sans-serif", fontSize:14 }}>No pick available today</div>
      )}
    </div>
  );
}

const SORT_OPTIONS = [
  { key:"confidence", label:"Confidence" },
  { key:"edge", label:"Edge" },
  { key:"time", label:"Game Time" },
  { key:"mlHome", label:"Moneyline" },
];

export default function App() {
  const [day, setDay] = useState("today");
  const [sportFilter, setSportFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("confidence");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedId, setExpandedId] = useState(null);

  const alexPick = mockGames.today.find(g => g.tag === "go_play");
  const dellyPick = mockGames.today.find(g => g.tag === "stay_away");

  const games = useMemo(() => {
    let list = [...mockGames[day]];
    if (sportFilter !== "ALL") list = list.filter(g => g.sport === sportFilter);
    list.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "time") {
        av = parseInt(a.time.replace(/[^0-9]/g,""));
        bv = parseInt(b.time.replace(/[^0-9]/g,""));
      }
      if (sortKey === "mlHome") { av = Math.abs(av); bv = Math.abs(bv); }
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return list;
  }, [day, sportFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const todayDate = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

  return (
    <div style={{ minHeight:"100vh", background:"#060a12", color:"#e2e8f4", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#0d1525; }
        ::-webkit-scrollbar-thumb { background:#1e2d4a; border-radius:3px; }
        .row-hover:hover { background:rgba(255,255,255,0.03) !important; cursor:pointer; }
        .sort-btn { cursor:pointer; user-select:none; transition:color 0.2s; }
        .sort-btn:hover { color:#63b3ed !important; }
        .tab-btn { cursor:pointer; transition:all 0.2s; }
        .sport-pill { cursor:pointer; transition:all 0.2s; }
        .expand-row { animation:fadeIn 0.2s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Top Nav */}
      <div style={{ borderBottom:"1px solid #1a2840", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, background:"rgba(6,10,18,0.95)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:"linear-gradient(135deg,#00ff87,#00bfff)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:18 }}>📊</span>
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:900, fontFamily:"'Bebas Neue',cursive", letterSpacing:2, color:"#e2e8f4", lineHeight:1 }}>EDGE REPORT</div>
            <div style={{ fontSize:10, color:"#3a5a7a", letterSpacing:2, fontWeight:500 }}>PREDICTION ENGINE</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:"#4a6a8a", letterSpacing:1 }}>{todayDate}</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#00ff87", boxShadow:"0 0 8px #00ff87" }} />
          <span style={{ fontSize:12, color:"#00ff87", fontWeight:600, letterSpacing:0.5 }}>LIVE</span>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px" }}>

        {/* Picks of the Day */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
            <div style={{ height:1, flex:1, background:"linear-gradient(90deg,transparent,#1a2840)" }} />
            <div style={{ fontSize:14, fontWeight:700, letterSpacing:4, color:"#4a6a8a", fontFamily:"'Bebas Neue',cursive" }}>◆ PICKS OF THE DAY ◆</div>
            <div style={{ height:1, flex:1, background:"linear-gradient(90deg,#1a2840,transparent)" }} />
          </div>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            <PickCard type="go" name="ALEX" imgB64={ALEX_IMG} imgType="jpeg" game={alexPick} />
            <PickCard type="stay" name="DELLY" imgB64={DELLY_IMG} imgType="jpeg" game={dellyPick} />
          </div>
        </div>

        {/* Table Controls */}
        <div style={{ background:"#0d1525", borderRadius:16, border:"1px solid #1a2840", overflow:"hidden" }}>
          <div style={{ padding:"20px 24px", borderBottom:"1px solid #1a2840", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div style={{ display:"flex", gap:4, background:"rgba(0,0,0,0.3)", borderRadius:10, padding:4 }}>
              {["today","tomorrow"].map(d => (
                <button key={d} className="tab-btn" onClick={() => setDay(d)} style={{
                  padding:"8px 20px", borderRadius:8, border:"none", cursor:"pointer",
                  background: day===d ? "linear-gradient(135deg,#00d4ff20,#00ff8720)" : "transparent",
                  color: day===d ? "#e2e8f4" : "#4a6a8a",
                  fontWeight: day===d ? 700 : 500,
                  fontSize:13, letterSpacing:0.5,
                  border: day===d ? "1px solid #00d4ff30" : "1px solid transparent",
                  fontFamily:"'Outfit',sans-serif",
                  transition:"all 0.2s"
                }}>
                  {d === "today" ? "🏒 Today" : "📅 Tomorrow"}
                </button>
              ))}
            </div>

            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#4a6a8a", letterSpacing:1, fontWeight:600 }}>SPORT:</span>
              {["ALL","NHL","NBA"].map(s => (
                <button key={s} className="sport-pill" onClick={() => setSportFilter(s)} style={{
                  padding:"5px 14px", borderRadius:20, border:"none", cursor:"pointer",
                  background: sportFilter===s ? (s==="NHL" ? "#00d4ff20" : s==="NBA" ? "#ff8c0020" : "#ffffff15") : "transparent",
                  color: sportFilter===s ? (s==="NHL" ? "#00d4ff" : s==="NBA" ? "#ff8c00" : "#e2e8f4") : "#4a6a8a",
                  fontWeight:700, fontSize:12, letterSpacing:1,
                  border: sportFilter===s ? `1px solid ${s==="NHL"?"#00d4ff40":s==="NBA"?"#ff8c0040":"#ffffff20"}` : "1px solid transparent",
                  fontFamily:"'Bebas Neue',cursive",
                }}>
                  {s}
                </button>
              ))}
            </div>

            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#4a6a8a", letterSpacing:1, fontWeight:600 }}>SORT:</span>
              {SORT_OPTIONS.map(opt => (
                <button key={opt.key} className="sort-btn" onClick={() => toggleSort(opt.key)} style={{
                  padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer",
                  background: sortKey===opt.key ? "rgba(99,179,237,0.12)" : "rgba(255,255,255,0.04)",
                  color: sortKey===opt.key ? "#63b3ed" : "#4a6a8a",
                  fontSize:12, fontWeight:600, letterSpacing:0.3,
                  border: sortKey===opt.key ? "1px solid #63b3ed40" : "1px solid transparent",
                  fontFamily:"'Outfit',sans-serif",
                  display:"flex", alignItems:"center", gap:4
                }}>
                  {opt.label} {sortKey===opt.key ? (sortDir==="desc" ? "↓" : "↑") : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div style={{ display:"grid", gridTemplateColumns:"90px 1fr 90px 140px 90px 100px 100px", gap:0, padding:"10px 24px", borderBottom:"1px solid #111d30", fontSize:11, fontWeight:700, letterSpacing:1.5, color:"#3a5a7a" }}>
            <span>SPORT</span>
            <span>MATCHUP</span>
            <span>TIME</span>
            <span>CONFIDENCE</span>
            <span>EDGE</span>
            <span>MONEYLINE</span>
            <span>TAG</span>
          </div>

          {/* Table Rows */}
          {games.length === 0 ? (
            <div style={{ padding:"48px", textAlign:"center", color:"#3a5a7a", fontSize:14 }}>No games match current filters</div>
          ) : (
            games.map((game, i) => {
              const isExpanded = expandedId === game.id;
              const edgeColor = game.edge >= 3 ? "#00ff87" : game.edge >= 1 ? "#ffc107" : "#ff3547";
              return (
                <div key={game.id}>
                  <div
                    className="row-hover"
                    onClick={() => setExpandedId(isExpanded ? null : game.id)}
                    style={{
                      display:"grid", gridTemplateColumns:"90px 1fr 90px 140px 90px 100px 100px",
                      gap:0, padding:"16px 24px", alignItems:"center",
                      borderBottom: isExpanded ? "none" : "1px solid #0f1a2e",
                      background: i%2===0 ? "transparent" : "rgba(255,255,255,0.015)",
                      transition:"background 0.15s"
                    }}
                  >
                    <div><SportBadge sport={game.sport} /></div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, fontFamily:"'Bebas Neue',cursive", letterSpacing:0.8, color:"#e2e8f4" }}>
                        {game.away.abbr} <span style={{ color:"#2a3a55", fontWeight:400 }}>@</span> {game.home.abbr}
                      </div>
                      <div style={{ fontSize:11, color:"#4a6a8a", marginTop:2 }}>
                        {game.away.name} at {game.home.name}
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:"#6a8aaa", fontWeight:500 }}>{game.time}</div>
                    <div style={{ paddingRight:16 }}><ConfidenceBar value={game.confidence} /></div>
                    <div style={{ fontSize:14, fontWeight:700, color:edgeColor, fontFamily:"'Bebas Neue',cursive", letterSpacing:0.5 }}>
                      {game.edge > 0 ? "+" : ""}{game.edge} pts
                    </div>
                    <div>
                      <div style={{ fontSize:12, color:"#c5cfe0", fontWeight:500 }}>H: {game.mlHome > 0 ? "+" : ""}{game.mlHome}</div>
                      <div style={{ fontSize:12, color:"#4a6a8a" }}>A: {game.mlAway > 0 ? "+" : ""}{game.mlAway}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <TagBadge tag={game.tag} label={game.tagLabel} />
                      <span style={{ color:"#2a3a55", fontSize:12 }}>{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="expand-row" style={{
                      padding:"16px 24px 20px",
                      borderBottom:"1px solid #0f1a2e",
                      background:"rgba(0,212,255,0.03)",
                      borderTop:"1px solid #0f1a2e"
                    }}>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16 }}>
                        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"14px 16px" }}>
                          <div style={{ fontSize:10, color:"#4a6a8a", letterSpacing:1.5, fontWeight:700, marginBottom:6 }}>MODEL NOTE</div>
                          <div style={{ fontSize:13, color:"#a0b0c8", lineHeight:1.5 }}>{game.note}</div>
                        </div>
                        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"14px 16px" }}>
                          <div style={{ fontSize:10, color:"#4a6a8a", letterSpacing:1.5, fontWeight:700, marginBottom:6 }}>SPREAD</div>
                          <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Bebas Neue',cursive", color:"#e2e8f4" }}>
                            {game.spread > 0 ? "+" : ""}{game.spread} ({game.spreadJuice})
                          </div>
                        </div>
                        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"14px 16px" }}>
                          <div style={{ fontSize:10, color:"#4a6a8a", letterSpacing:1.5, fontWeight:700, marginBottom:6 }}>OVER/UNDER</div>
                          <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Bebas Neue',cursive", color:"#e2e8f4" }}>O/U {game.ou}</div>
                        </div>
                        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"14px 16px" }}>
                          <div style={{ fontSize:10, color:"#4a6a8a", letterSpacing:1.5, fontWeight:700, marginBottom:6 }}>PREDICTION</div>
                          <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Bebas Neue',cursive", color:"#00ff87" }}>{game.prediction} TO WIN</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Footer */}
          <div style={{ padding:"14px 24px", borderTop:"1px solid #111d30", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"#2a3a55" }}>{games.length} game{games.length!==1?"s":""} • {day === "today" ? "Today" : "Tomorrow"}</span>
            <span style={{ fontSize:11, color:"#2a3a55" }}>Click any row to expand details</span>
          </div>
        </div>
      </div>
    </div>
  );
}
