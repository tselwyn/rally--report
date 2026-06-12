import React, { useState } from "react";

// ---------- PARSING ----------
const ROW_RE =
  /(\d{1,2}\/\d{1,2}\/\d{4})[\s|]*#?(\d+)?\s*([A-Za-zÀ-ÿ.'\- ]+?)[\s|]+(W|L)[\s|]+([\s\S]*?)(?=\d{1,2}\/\d{1,2}\/\d{4}|Copyright|$)/g;

// Pull the player's name from the page if we can find it
function extractPlayerName(doc) {
  const h1 = doc.querySelector("h1");
  if (h1) return h1.textContent.replace(/-?\s*Match Log/i, "").trim();
  return "";
}

// Convert the fetched HTML into clean "date | rank name | result | score" lines
function htmlToRows(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const name = extractPlayerName(doc);
  const rows = [...doc.querySelectorAll("table tr")]
    .map((tr) =>
      [...tr.querySelectorAll("td")]
        .map((td) => td.textContent.replace(/\s+/g, " ").trim())
        .join(" | ")
    )
    .filter(Boolean)
    .join("\n");
  return { text: rows || doc.body.textContent, name };
}

function parseLog(text) {
  const matches = [];
  let m;
  ROW_RE.lastIndex = 0;
  while ((m = ROW_RE.exec(text)) !== null) {
    const [, date, rank, opp, res, rawScore] = m;
    const score = rawScore.replace(/[|]/g, "").replace(/\s+/g, " ").trim();
    const d = new Date(date);
    if (isNaN(d)) continue;
    matches.push({
      date: d,
      rank: rank ? parseInt(rank) : null,
      opp: opp.trim(),
      win: res === "W",
      score,
    });
  }
  return matches.sort((a, b) => a.date - b.date);
}

// ---------- STATS ----------
function computeStats(ms) {
  if (!ms.length) return null;
  const wins = ms.filter((x) => x.win).length;
  const total = ms.length;

  const byYear = {};
  ms.forEach((x) => {
    const y = x.date.getFullYear();
    byYear[y] = byYear[y] || { w: 0, l: 0 };
    x.win ? byYear[y].w++ : byYear[y].l++;
  });

  const h2h = {};
  ms.forEach((x) => {
    h2h[x.opp] = h2h[x.opp] || { w: 0, l: 0 };
    x.win ? h2h[x.opp].w++ : h2h[x.opp].l++;
  });

  let bestW = 0,
    bestL = 0,
    curW = 0,
    curL = 0;
  ms.forEach((x) => {
    if (x.win) {
      curW++;
      curL = 0;
      if (curW > bestW) bestW = curW;
    } else {
      curL++;
      curW = 0;
      if (curL > bestL) bestL = curL;
    }
  });
  const last = ms[ms.length - 1];
  let curStreak = 1;
  for (let i = ms.length - 2; i >= 0; i--) {
    if (ms[i].win === last.win) curStreak++;
    else break;
  }

  const stb = ms.filter((x) => /,\s*\(\d+-\d+\)\s*$/.test(x.score));
  const stbW = stb.filter((x) => x.win).length;

  let tbSets = 0;
  ms.forEach((x) => {
    const sets = x.score.match(/7-6|6-7/g);
    if (sets) tbSets += sets.length;
  });

  let bagelSets = 0;
  const doubleBagels = [];
  ms.forEach((x) => {
    const b = (x.score.match(/6-0/g) || []).length;
    bagelSets += b;
    if (b >= 2) doubleBagels.push(x);
  });

  const cutoff = new Date(last.date);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const recent = ms.filter((x) => x.date >= cutoff);
  const recentW = recent.filter((x) => x.win).length;

  const topWins = ms.filter((x) => x.win && x.rank === 1);
  const forfeits = ms.filter((x) => /forfeit/i.test(x.score));

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthCount = {};
  ms.forEach((x) => {
    const k = monthNames[x.date.getMonth()];
    monthCount[k] = (monthCount[k] || 0) + 1;
  });
  const busiest = Object.entries(monthCount).sort((a, b) => b[1] - a[1])[0];

  return {
    ms, wins, losses: total - wins, total,
    winPct: (wins / total) * 100,
    byYear, h2h, bestW, bestL,
    curStreak: { len: curStreak, win: last.win },
    stb: { total: stb.length, w: stbW, l: stb.length - stbW },
    tbSets, bagelSets, doubleBagels,
    recent: { w: recentW, l: recent.length - recentW, total: recent.length },
    topWins, forfeits, busiest,
    firstDate: ms[0].date, lastDate: last.date,
    oppCount: Object.keys(h2h).length,
  };
}

const pct = (w, l) => (w + l ? Math.round((w / (w + l)) * 100) : 0);
const fmtD = (d) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ---------- THEME ----------
const C = {
  court: "#1B4D3E",
  line: "#F5F2E8",
  ball: "#D8F529",
  clay: "#0F2E25",
  red: "#E8604C",
  mute: "rgba(245,242,232,0.55)",
};

// ---------- UI ----------
function Label({ children }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.mute, marginBottom: 10, fontFamily: "ui-monospace, monospace" }}>
      {children}
    </div>
  );
}

function Card({ children, span }) {
  return (
    <div style={{ background: "rgba(15,46,37,0.6)", border: "1px solid rgba(245,242,232,0.15)", borderRadius: 4, padding: 20, gridColumn: span ? "1 / -1" : undefined }}>
      {children}
    </div>
  );
}

function Big({ v, sub, color }) {
  return (
    <div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 36, fontWeight: 700, color: color || C.line, lineHeight: 1.1 }}>{v}</div>
      <div style={{ fontSize: 13, color: C.mute, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function Scoreboard({ s, name }) {
  return (
    <div style={{ background: C.clay, border: `2px solid ${C.line}`, borderRadius: 4, padding: "28px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", width: 2, height: "100%", background: "rgba(245,242,232,0.12)" }} />
      <div style={{ fontSize: 12, letterSpacing: 4, color: C.mute, textTransform: "uppercase", fontFamily: "ui-monospace, monospace" }}>
        {name ? `${name} — Career Record` : "Career Record"}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 18, marginTop: 8 }}>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "clamp(52px, 12vw, 88px)", fontWeight: 700, color: C.ball, lineHeight: 1 }}>{s.wins}</span>
        <span style={{ fontSize: 28, color: C.mute }}>–</span>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "clamp(52px, 12vw, 88px)", fontWeight: 700, color: C.line, lineHeight: 1 }}>{s.losses}</span>
      </div>
      <div style={{ marginTop: 10, fontSize: 14, color: C.mute, fontFamily: "ui-monospace, monospace" }}>
        {s.winPct.toFixed(1)}% · {s.total} matches · {s.oppCount} opponents · {fmtD(s.firstDate)} → {fmtD(s.lastDate)}
      </div>
    </div>
  );
}

function FormStrip({ ms }) {
  const recent = ms.slice(-30);
  return (
    <div>
      <Label>Last {recent.length} matches</Label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {recent.map((m, i) => (
          <div
            key={i}
            title={`${fmtD(m.date)} vs ${m.opp}: ${m.win ? "W" : "L"} ${m.score}`}
            style={{
              width: 18, height: 18, borderRadius: "50%",
              background: m.win ? C.ball : "transparent",
              border: `2px solid ${m.win ? C.ball : C.red}`,
              boxShadow: m.win ? "inset 0 -2px 0 rgba(0,0,0,0.25)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function YearBars({ byYear }) {
  const years = Object.keys(byYear).sort();
  return (
    <div>
      <Label>Win rate by year</Label>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
        {years.map((y) => {
          const { w, l } = byYear[y];
          const p = pct(w, l);
          return (
            <div key={y} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ fontSize: 13, fontFamily: "ui-monospace, monospace", color: C.ball }}>{p}%</div>
              <div style={{ width: "100%", maxWidth: 48, height: `${Math.max(p, 4)}%`, background: C.ball, borderRadius: "2px 2px 0 0", opacity: 0.4 + (p / 100) * 0.6 }} />
              <div style={{ fontSize: 12, color: C.mute, fontFamily: "ui-monospace, monospace" }}>{y}</div>
              <div style={{ fontSize: 11, color: C.mute }}>{w}-{l}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function H2H({ h2h }) {
  const rows = Object.entries(h2h)
    .map(([opp, r]) => ({ opp, ...r, total: r.w + r.l }))
    .filter((r) => r.total >= 2)
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);
  return (
    <div>
      <Label>Head to head (2+ matches)</Label>
      {rows.map((r) => (
        <div key={r.opp} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(245,242,232,0.08)" }}>
          <div style={{ flex: 1, fontSize: 14, color: C.line, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.opp}</div>
          <div style={{ width: 90, height: 8, background: "rgba(232,96,76,0.5)", borderRadius: 4, overflow: "hidden", flexShrink: 0 }}>
            <div style={{ width: `${pct(r.w, r.l)}%`, height: "100%", background: C.ball }} />
          </div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 14, color: r.w >= r.l ? C.ball : C.red, width: 52, textAlign: "right", flexShrink: 0 }}>
            {r.w}-{r.l}
          </div>
        </div>
      ))}
    </div>
  );
}

function Insights({ s }) {
  const items = [];
  const h2hArr = Object.entries(s.h2h).map(([opp, r]) => ({ opp, ...r, total: r.w + r.l }));
  const rival = [...h2hArr].sort((a, b) => b.total - a.total)[0];
  if (rival && rival.total >= 4)
    items.push(
      `Biggest rivalry: ${rival.opp} — ${rival.total} matches, ${rival.w}-${rival.l}. ${
        Math.abs(rival.w - rival.l) <= 2
          ? "Dead even. This one's personal."
          : rival.w > rival.l
          ? "You own this matchup."
          : "Time to flip the script."
      }`
    );
  const owned = h2hArr.filter((r) => r.total >= 4 && r.l === 0).sort((a, b) => b.total - a.total)[0];
  if (owned) items.push(`Total ownership: ${owned.w}-0 against ${owned.opp}. They may want to stop challenging you.`);
  const krypt = h2hArr.filter((r) => r.total >= 4 && r.w === 0).sort((a, b) => b.total - a.total)[0];
  if (krypt) items.push(`Kryptonite: 0-${krypt.l} vs ${krypt.opp}. Film study required.`);
  if (s.stb.total >= 5) {
    const cp = pct(s.stb.w, s.stb.l);
    items.push(
      `${Math.round((s.stb.total / s.total) * 100)}% of your matches went to a deciding super tiebreak (${s.stb.w}-${s.stb.l}). ${
        cp >= 55 ? "You're clutch when it counts." : "Closing tight matches is the single biggest lever in your record."
      }`
    );
  }
  if (s.topWins.length) items.push(`Giant killer: ${s.topWins.length} win${s.topWins.length > 1 ? "s" : ""} over the #1 ranked player on the ladder.`);
  if (s.doubleBagels.length) items.push(`Double bagels served: ${s.doubleBagels.length} (6-0, 6-0). Ruthless.`);
  if (s.recent.total >= 8) {
    const rp = pct(s.recent.w, s.recent.l);
    items.push(
      `Last 12 months: ${s.recent.w}-${s.recent.l} (${rp}%) — ${
        rp > s.winPct + 3
          ? "you're trending up, playing your best tennis right now."
          : rp < s.winPct - 3
          ? "below your career pace. Time to grind."
          : "right on your career pace."
      }`
    );
  }
  if (s.busiest) items.push(`Busiest month historically: ${s.busiest[0]} (${s.busiest[1]} matches).`);
  return (
    <div>
      <Label>Coach's notes</Label>
      {items.map((t, i) => (
        <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", fontSize: 14, lineHeight: 1.5, color: C.line, borderBottom: i < items.length - 1 ? "1px solid rgba(245,242,232,0.08)" : "none" }}>
          <span style={{ color: C.ball, flexShrink: 0 }}>›</span>
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- APP ----------
export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [player, setPlayer] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [raw, setRaw] = useState("");

  const buildFromText = (text, name = "") => {
    const ms = parseLog(text);
    if (ms.length < 2) {
      setError("Couldn't find match rows on that page. Double-check it's a public match log link.");
      return false;
    }
    setError("");
    setPlayer(name);
    setStats(computeStats(ms));
    return true;
  };

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/fetch-log?url=${encodeURIComponent(url.trim())}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Fetch failed");
      const { text, name } = htmlToRows(data.html);
      buildFromText(text, name);
    } catch (e) {
      setError(e.message || "Couldn't load that link. Try the paste option below.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.court, fontFamily: "system-ui, -apple-system, sans-serif", color: C.line }}>
      <div style={{ height: 6, background: `repeating-linear-gradient(90deg, ${C.line} 0 40px, transparent 40px 80px)`, opacity: 0.25 }} />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 64px" }}>
        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.ball, position: "relative", overflow: "hidden", boxShadow: "inset -3px -3px 0 rgba(0,0,0,0.2)" }}>
              <div style={{ position: "absolute", inset: 0, borderTop: `2.5px solid ${C.court}`, borderRadius: "50%", transform: "rotate(-30deg) translateY(6px)" }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>Rally Report</h1>
          </div>
          <p style={{ color: C.mute, fontSize: 15, marginTop: 8, maxWidth: 520 }}>
            Paste your TennisRungs match log link. Get your full scouting report — record, rivalries, clutch stats, and what to work on.
          </p>
        </header>

        {!stats && (
          <div style={{ background: "rgba(15,46,37,0.6)", border: "1px solid rgba(245,242,232,0.15)", borderRadius: 4, padding: 20 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="https://app.tennisrungs.com/Public/PlayerMatches?teamId=..."
                style={{ flex: "1 1 320px", boxSizing: "border-box", background: C.clay, border: "1px solid rgba(245,242,232,0.2)", borderRadius: 4, color: C.line, padding: "12px 14px", fontSize: 15 }}
              />
              <button
                onClick={handleFetch}
                disabled={loading || !url.trim()}
                style={{ background: C.ball, color: C.clay, border: "none", borderRadius: 4, padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: loading || !url.trim() ? "not-allowed" : "pointer", opacity: loading || !url.trim() ? 0.6 : 1 }}
              >
                {loading ? "Reading match log..." : "Build my report"}
              </button>
            </div>

            {error && (
              <div style={{ marginTop: 14, padding: 12, background: "rgba(232,96,76,0.15)", border: `1px solid ${C.red}`, borderRadius: 4, fontSize: 14 }}>
                {error}
              </div>
            )}

            <button
              onClick={() => setShowPaste(!showPaste)}
              style={{ marginTop: 14, background: "none", border: "none", color: C.mute, fontSize: 13, cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              {showPaste ? "Hide paste option" : "Link not working? Paste your match log instead"}
            </button>

            {showPaste && (
              <div style={{ marginTop: 12 }}>
                <textarea
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  placeholder={"Open your match log page, select all, copy, paste here.\n\n6/7/2026  #3 Jane Doe  L  3-6,6-4, (10-7)\n6/5/2026  #7 John Smith  W  6-3,6-1"}
                  style={{ width: "100%", boxSizing: "border-box", height: 160, background: C.clay, border: "1px solid rgba(245,242,232,0.2)", borderRadius: 4, color: C.line, padding: 12, fontSize: 13, fontFamily: "ui-monospace, monospace", resize: "vertical" }}
                />
                <button
                  onClick={() => buildFromText(raw)}
                  disabled={!raw.trim()}
                  style={{ marginTop: 10, background: "none", border: `1px solid ${C.ball}`, color: C.ball, borderRadius: 4, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: raw.trim() ? "pointer" : "not-allowed", opacity: raw.trim() ? 1 : 0.5 }}
                >
                  Build from pasted log
                </button>
              </div>
            )}
          </div>
        )}

        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Scoreboard s={stats} name={player} />
            </div>

            <Card span><FormStrip ms={stats.ms} /></Card>

            <Card>
              <Label>Streaks</Label>
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                <Big v={stats.bestW} sub="longest win streak" color={C.ball} />
                <Big v={stats.bestL} sub="longest skid" color={C.red} />
                <Big v={`${stats.curStreak.win ? "W" : "L"}${stats.curStreak.len}`} sub="current streak" color={stats.curStreak.win ? C.ball : C.red} />
              </div>
            </Card>

            <Card>
              <Label>Clutch</Label>
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                <Big v={`${stats.stb.w}-${stats.stb.l}`} sub="deciding super tiebreaks" color={stats.stb.w >= stats.stb.l ? C.ball : C.red} />
                <Big v={stats.tbSets} sub="sets to 7-6" />
                <Big v={stats.bagelSets} sub="6-0 sets" />
              </div>
            </Card>

            <Card span><YearBars byYear={stats.byYear} /></Card>
            <Card span><H2H h2h={stats.h2h} /></Card>
            <Card span><Insights s={stats} /></Card>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => { setStats(null); setUrl(""); setRaw(""); setPlayer(""); }}
                style={{ background: "none", border: `1px solid ${C.mute}`, color: C.line, borderRadius: 4, padding: "10px 22px", fontSize: 14, cursor: "pointer" }}
              >
                Analyze another player
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
