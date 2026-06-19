import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

// ---------- ROSTER ----------
const ROSTER = [
  { name: "Aboudi Tayara", teamId: "166714797" },
  { name: "Adrian Gacu", teamId: "163102950" },
  { name: "Andy Wolfenbarger", teamId: "131924864" },
  { name: "Brian Houk", teamId: "167226075" },
  { name: "Cameron Jennings", teamId: "159497364" },
  { name: "Cameron Miller", teamId: "148915878" },
  { name: "Charles Jennings", teamId: "144958849" },
  { name: "Chris Curtin", teamId: "135138017" },
  { name: "Chris Mallory", teamId: "133465411" },
  { name: "Christian Aviles", teamId: "165933825" },
  { name: "Cody Abelende", teamId: "140580583" },
  { name: "Cole McCommons", teamId: "142685566" },
  { name: "Curtis Harris", teamId: "131830767" },
  { name: "Dave Bryant", teamId: "156433303" },
  { name: "Derrick Owusu-Ababio", teamId: "153926795" },
  { name: "Deven Jani", teamId: "141447343" },
  { name: "Dusten Rees", teamId: "131877764" },
  { name: "Dylan Schwarzmann", teamId: "132488388" },
  { name: "Felix Asamoah-Darko", teamId: "151665522" },
  { name: "Frank Graves", teamId: "131877798" },
  { name: "Freedman Kim", teamId: "133541428" },
  { name: "Gregg Sprow", teamId: "131877763" },
  { name: "Gustavo Elias", teamId: "166385247" },
  { name: "Hugo Navia", teamId: "161181043" },
  { name: "Jahrome Fletcher", teamId: "165785641" },
  { name: "Jamie Bronson", teamId: "144638525" },
  { name: "Jeff Trexel", teamId: "141873753" },
  { name: "Joel Pittman", teamId: "148156023" },
  { name: "Jose Ordonez", teamId: "131877815" },
  { name: "Kay Adjei", teamId: "140132996" },
  { name: "Lorenzo Cruz", teamId: "166016861" },
  { name: "Lucas Umberger", teamId: "132637509" },
  { name: "Luis Aragon", teamId: "165196037" },
  { name: "Mark Willis", teamId: "166863724" },
  { name: "Matt Freitag", teamId: "133465394" },
  { name: "Matt Selwyn", teamId: "131830724" },
  { name: "Max Freitag", teamId: "132673552" },
  { name: "Moe Cornejo", teamId: "131877779" },
  { name: "Monica Borobia", teamId: "160701578" },
  { name: "Nathan Nguyen", teamId: "163994833" },
  { name: "Nico Rublein", teamId: "131830762" },
  { name: "Omari Bailey", teamId: "166003841" },
  { name: "Owen Seely", teamId: "131830730" },
  { name: "Patrick Phan", teamId: "148205059" },
  { name: "Rameez Syed", teamId: "147690599" },
  { name: "Ryan Wolfenbarger", teamId: "141363254" },
  { name: "Sara Abebe", teamId: "167341230" },
  { name: "Sean Park", teamId: "137693572" },
  { name: "Thad Thompson", teamId: "140067971" },
  { name: "Tyler Selwyn", teamId: "159997966" },
];

const logUrl = (teamId) =>
  `https://app.tennisrungs.com/Public/PlayerMatches?teamId=${teamId}`;

const RANKINGS_URL =
  "https://app.tennisrungs.com/fxbg-tennis-club/tennis-ladders/fxbg-singles-tennis/131837707";

// Parse the ladder rankings page into rows matching TennisRungs columns.
function parseRankings(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out = [];
  const rows = [...doc.querySelectorAll("table tr")];
  for (const tr of rows) {
    const cells = [...tr.querySelectorAll("td")];
    if (cells.length < 6) continue;
    const rankRaw = cells[0].textContent.replace(/\s+/g, " ").trim();
    if (!/^#?\d+$/.test(rankRaw)) continue; // skip header / non-data rows
    const link = cells[1].querySelector("a");
    const teamIdMatch = link ? link.getAttribute("href").match(/teamId=(\d+)/) : null;
    const challengeEl = cells[6];
    const challengeLink = challengeEl ? challengeEl.querySelector("a") : null;
    const challenge = challengeLink
      ? (challengeLink.getAttribute("title") || challengeLink.textContent).replace(/\s+/g, " ").trim()
      : "";
    out.push({
      rank: rankRaw.replace("#", ""),
      name: cells[1].textContent.replace(/\s+/g, " ").trim(),
      teamId: teamIdMatch ? teamIdMatch[1] : null,
      wins: cells[2].textContent.trim(),
      losses: cells[3].textContent.trim(),
      streak: cells[4].textContent.trim(),
      movement: cells[5].textContent.trim(),
      challenge,
    });
  }
  return out;
}

// ---------- CONTACTS ----------
// When Dad publishes the sheet (File > Share > Publish to web > CSV), paste that
// URL here and the Contact tab reads live from it. Until then, the bundled
// snapshot below is used as a fallback so the tab still works.
const CONTACTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiN_IbCQVAcyQCQ1FsQ2A8JPaxwlQ-vT5lZ7pYqIKC5696kuBFlbjXH5ca7a8IZwHW736c0oBxC1SG/pub?gid=0&single=true&output=csv";

// Snapshot of current (active + temp-drop) players. Fallback only.
const CONTACTS_FALLBACK = [
  { name: "Sara Abebe", email: "sarabbblock@gmail.com", phone: "737-932-0349", rating: "3.0" },
  { name: "Kay Adjei", email: "djanadwo@gmail.com", phone: "703-347-5498", rating: "3.5" },
  { name: "Luis Aragon", email: "luis@luisaragon.com", phone: "703-203-5902", rating: "4.0" },
  { name: "Felix Asamoah-Darko", email: "adarko.felix@yahoo.com", phone: "917-374-9089", rating: "3.5" },
  { name: "Cristian Aviles", email: "cristian@verospaint.com", phone: "301-272-7662", rating: "3.0" },
  { name: "Omari Bailey", email: "omarijbailey@gmail.com", phone: "540-538-9746", rating: "3.0" },
  { name: "Monica Borobia", email: "monicaborobia@gmail.com", phone: "516-693-8095", rating: "4.5" },
  { name: "Dave Bryant", email: "dpbryantjr@gmail.com", phone: "540-220-3187", rating: "3.5" },
  { name: "Moe Cornejo", email: "moec810@netscape.net", phone: "540-308-1153", rating: "3.5" },
  { name: "Lorenzo Cruz", email: "cruz.lorenzo10@gmail.com", phone: "240-383-5774", rating: "4.0" },
  { name: "Jake Dodges", email: "jake.dodges2@gmail.com", phone: "240-298-7749", rating: "3.5" },
  { name: "Gustavo Elias", email: "gustavo.a.elias@gmail.com", phone: "301-848-9102", rating: "3.5" },
  { name: "Jahrome Fletcher", email: "jahromefletcher@gmail.com", phone: "540-368-4464", rating: "3.5" },
  { name: "Matt Freitag", email: "Laddiefreitag@gmail.com", phone: "973-902-8070", rating: "3.0" },
  { name: "Max Freitag", email: "maxfry2003@gmail.com", phone: "607-427-8003", rating: "4.0" },
  { name: "Adrian Gacu", email: "artrusseladrian@gmail.com", phone: "240-222-2116", rating: "3.0" },
  { name: "Frank Graves", email: "fgraves77@gmail.com", phone: "757-618-9565", rating: "4.0" },
  { name: "Curtis Harris", email: "CHarrisLLL@aol.com", phone: "703-346-8767", rating: "4.0" },
  { name: "Brian Houk", email: "bhouk277@gmail.com", phone: "540-834-8154", rating: "3.5" },
  { name: "Deven Jani", email: "devenjani14@gmail.com", phone: "540-848-4328", rating: "4.0" },
  { name: "Cameron Jennings", email: "cameronjennings4040@gmail.com", phone: "540-848-2360", rating: "4.0" },
  { name: "Charles Jennings", email: "ccjfly13@gmail.com", phone: "540-455-4133", rating: "3.0" },
  { name: "Freedman Kim", email: "okfreedman@gmail.com", phone: "434-907-9818", rating: "3.5" },
  { name: "Chris Mallory", email: "cmallory370@gmail.com", phone: "540-322-9351", rating: "3.5" },
  { name: "Hugo Navia", email: "naviahugo@hotmail.com", phone: "202-445-5149", rating: "4.0" },
  { name: "Nathan Nguyen", email: "nguyen.nathan2602@gmail.com", phone: "469-222-9484", rating: "" },
  { name: "Bryan Ordonez", email: "ordonez.bryan777@gmail.com", phone: "540-938-0467", rating: "" },
  { name: "Jose Ordonez", email: "Oramon777@hotmail.com", phone: "540-259-2337", rating: "3.5" },
  { name: "Derrick Owusu-Ababio", email: "doababio@gmail.com", phone: "240-898-6207", rating: "3.5" },
  { name: "Sean Park", email: "sangil43@gmail.com", phone: "540-846-7002", rating: "3.0" },
  { name: "Patrick Phan", email: "phuongdkphan@gmail.com", phone: "703-459-8047", rating: "3.5" },
  { name: "Joel Pittman", email: "joelpittman@comcast.net", phone: "540-408-2278", rating: "3.5" },
  { name: "Dusten Rees", email: "Dus10rees@gmail.com", phone: "540-220-3588", rating: "3.5" },
  { name: "Nico Rublein", email: "Usmcnicorublein@gmail.com", phone: "540-834-8868", rating: "3.0" },
  { name: "Dylan Schwarzmann", email: "d_schwarzmann2311@aol.com", phone: "540-422-3803", rating: "4.0" },
  { name: "Owen Seely", email: "owendseely@gmail.com", phone: "540-538-3698", rating: "4.0" },
  { name: "Matt Selwyn", email: "mselwyn20@gmail.com", phone: "540-498-0799", rating: "4.0" },
  { name: "Tyler Selwyn", email: "tylerselwyn427@gmail.com", phone: "540-809-7867", rating: "4.0" },
  { name: "Gregg Sprow", email: "sprow@cox.net", phone: "540-845-4436", rating: "4.0" },
  { name: "Rameez Syed", email: "rameez500@gmail.com", phone: "413-309-5011", rating: "4.0" },
  { name: "Aboudi Tayara", email: "abouditayara556@gmail.com", phone: "540-282-0215", rating: "" },
  { name: "Thad Thompson", email: "thaddeus94t@gmail.com", phone: "540-903-2557", rating: "3.5" },
  { name: "Jeff Trexel", email: "jefftrexel@gmail.com", phone: "703-282-5706", rating: "3.0" },
  { name: "Sam Valasko", email: "svalasko@gmail.com", phone: "540-760-8807", rating: "3.5" },
  { name: "Adam Walters", email: "adamwalters2006@gmail.com", phone: "757-332-5265", rating: "3.5" },
  { name: "Mark Willis", email: "rubbertramp@hotmail.com", phone: "540-848-5348", rating: "4.5" },
  { name: "Andy Wolfenbarger", email: "andywolfenbarger@gmail.com", phone: "571-722-7433", rating: "4.0" },
  { name: "Ryan Wolfenbarger", email: "ryanpwolfenbarger@gmail.com", phone: "540-207-8219", rating: "3.5" },
  { name: "Jae Yoo", email: "tkd1100@yahoo.com", phone: "703-999-1602", rating: "3.5" },
].sort((a, b) => a.name.localeCompare(b.name));

// Parse one CSV line, respecting quoted fields that may contain commas.
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

// Parse the published-CSV text into contact objects. Detects columns by header
// name so it survives column reordering. Skips rows marked "Dropped".
function parseContactsCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (!lines.length) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const col = (...names) => {
    for (const n of names) {
      const idx = header.findIndex((h) => h.includes(n));
      if (idx !== -1) return idx;
    }
    return -1;
  };
  const iLast = col("last");
  const iFirst = col("first");
  const iName = col("name");
  const iEmail = col("email", "e-mail");
  const iPhone = col("phone", "cell", "mobile", "number");
  const iRating = col("rating", "ntrp", "level");
  const iNotes = col("note", "status", "drop");

  const out = [];
  for (let r = 1; r < lines.length; r++) {
    const cells = splitCsvLine(lines[r]);
    const get = (i) => (i >= 0 && i < cells.length ? cells[i] : "");

    let name = "";
    if (iFirst >= 0 || iLast >= 0) {
      name = `${get(iFirst)} ${get(iLast)}`.trim();
    } else if (iName >= 0) {
      name = get(iName);
    }
    if (!name) continue;

    const notes = get(iNotes).toLowerCase();
    if (notes.includes("dropped")) continue;

    out.push({
      name,
      email: get(iEmail),
      phone: get(iPhone),
      rating: get(iRating),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

// ---------- PARSING ----------
const ROW_RE =
  /(\d{1,2}\/\d{1,2}\/\d{4})[\s|]*#?(\d+)?\s*([A-Za-zÀ-ÿ.'\- ]+?)[\s|]+(W|L)[\s|]+([\s\S]*?)(?=\d{1,2}\/\d{1,2}\/\d{4}|Copyright|$)/g;

function htmlToRows(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const rows = [...doc.querySelectorAll("table tr")]
    .map((tr) =>
      [...tr.querySelectorAll("td")]
        .map((td) => td.textContent.replace(/\s+/g, " ").trim())
        .join(" | ")
    )
    .filter(Boolean)
    .join("\n");
  return rows || doc.body.textContent;
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

  let bestW = 0, bestL = 0, curW = 0, curL = 0;
  ms.forEach((x) => {
    if (x.win) { curW++; curL = 0; if (curW > bestW) bestW = curW; }
    else { curL++; curW = 0; if (curL > bestL) bestL = curL; }
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

function Logo({ size = 26 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: C.ball, position: "relative", overflow: "hidden", boxShadow: "inset -3px -3px 0 rgba(0,0,0,0.2)", flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, borderTop: `2.5px solid ${C.court}`, borderRadius: "50%", transform: "rotate(-30deg) translateY(6px)" }} />
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
          ? "Owns this matchup."
          : "Trails this one."
      }`
    );
  const owned = h2hArr.filter((r) => r.total >= 4 && r.l === 0).sort((a, b) => b.total - a.total)[0];
  if (owned) items.push(`Total ownership: ${owned.w}-0 against ${owned.opp}.`);
  const krypt = h2hArr.filter((r) => r.total >= 4 && r.w === 0).sort((a, b) => b.total - a.total)[0];
  if (krypt) items.push(`Kryptonite: 0-${krypt.l} vs ${krypt.opp}.`);
  if (s.stb.total >= 5) {
    const cp = pct(s.stb.w, s.stb.l);
    items.push(
      `${Math.round((s.stb.total / s.total) * 100)}% of matches went to a deciding super tiebreak (${s.stb.w}-${s.stb.l}). ${
        cp >= 55 ? "Clutch when it counts." : "Closing tight matches is the biggest lever here."
      }`
    );
  }
  if (s.topWins.length) items.push(`Giant killer: ${s.topWins.length} win${s.topWins.length > 1 ? "s" : ""} over the #1 ranked player.`);
  if (s.doubleBagels.length) items.push(`Double bagels served: ${s.doubleBagels.length} (6-0, 6-0).`);
  if (s.recent.total >= 8) {
    const rp = pct(s.recent.w, s.recent.l);
    items.push(
      `Last 12 months: ${s.recent.w}-${s.recent.l} (${rp}%) — ${
        rp > s.winPct + 3
          ? "trending up, playing their best tennis right now."
          : rp < s.winPct - 3
          ? "below career pace lately."
          : "right on career pace."
      }`
    );
  }
  if (s.busiest) items.push(`Busiest month historically: ${s.busiest[0]} (${s.busiest[1]} matches).`);
  return (
    <div>
      <Label>Scouting notes</Label>
      {items.map((t, i) => (
        <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", fontSize: 14, lineHeight: 1.5, color: C.line, borderBottom: i < items.length - 1 ? "1px solid rgba(245,242,232,0.08)" : "none" }}>
          <span style={{ color: C.ball, flexShrink: 0 }}>›</span>
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}

function MatchLog({ ms }) {
  const [oppFilter, setOppFilter] = useState(null);
  // newest first
  const ordered = [...ms].reverse();
  const shown = oppFilter ? ordered.filter((m) => m.opp === oppFilter) : ordered;

  // record vs the filtered opponent
  let filtRecord = null;
  if (oppFilter) {
    const w = shown.filter((m) => m.win).length;
    filtRecord = `${w}-${shown.length - w}`;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <Label>{oppFilter ? `vs ${oppFilter}` : `All matches (${ordered.length})`}</Label>
        {oppFilter && (
          <button
            onClick={() => setOppFilter(null)}
            style={{ background: "none", border: `1px solid ${C.mute}`, color: C.line, borderRadius: 4, padding: "4px 12px", fontSize: 12, cursor: "pointer" }}
          >
            {filtRecord} · clear filter ✕
          </button>
        )}
      </div>
      {!oppFilter && (
        <div style={{ fontSize: 12, color: C.mute, marginBottom: 12 }}>
          Tip: tap any opponent's name to see only those matches.
        </div>
      )}
      <div>
        {shown.map((m, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(245,242,232,0.08)" }}
          >
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: C.mute, width: 76, flexShrink: 0 }}>
              {fmtD(m.date)}
            </div>
            <div
              style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 700,
                background: m.win ? C.ball : "transparent",
                border: `2px solid ${m.win ? C.ball : C.red}`,
                color: m.win ? C.clay : C.red,
              }}
            >
              {m.win ? "W" : "L"}
            </div>
            <button
              onClick={() => setOppFilter(m.opp === oppFilter ? null : m.opp)}
              style={{ flex: 1, textAlign: "left", background: "none", border: "none", color: C.line, fontSize: 14, cursor: "pointer", padding: 0, textDecoration: "underline", textDecorationColor: "rgba(245,242,232,0.25)" }}
            >
              {m.opp}
            </button>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, color: C.mute, textAlign: "right", flexShrink: 0 }}>
              {m.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toggle({ view, setView }) {
  const opt = (key, label) => (
    <button
      onClick={() => setView(key)}
      style={{
        background: view === key ? C.ball : "transparent",
        color: view === key ? C.clay : C.line,
        border: `1px solid ${view === key ? C.ball : "rgba(245,242,232,0.25)"}`,
        borderRadius: 4, padding: "8px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {opt("summary", "Summary")}
      {opt("log", "Match Log")}
    </div>
  );
}

function Report({ stats, name }) {
  const [view, setView] = useState("summary");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <Scoreboard s={stats} name={name} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <Toggle view={view} setView={setView} />
      </div>

      {view === "summary" ? (
        <>
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
        </>
      ) : (
        <Card span><MatchLog ms={stats.ms} /></Card>
      )}
    </div>
  );
}

// ---------- RANKINGS VIEW ----------
function MovementArrow({ m }) {
  const v = (m || "").toLowerCase();
  if (v.includes("up")) return <span style={{ color: C.ball }} title="Up">▲</span>;
  if (v.includes("down")) return <span style={{ color: C.red }} title="Down">▼</span>;
  return <span style={{ color: C.mute }} title="Neutral">–</span>;
}

function Rankings({ onPlayer }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/fetch-log?url=${encodeURIComponent(RANKINGS_URL)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.html) throw new Error(data.error || "Couldn't load rankings");
        const parsed = parseRankings(data.html);
        if (!parsed.length) throw new Error("No rankings found.");
        setRows(parsed);
      })
      .catch((e) => !cancelled && setError(e.message || "Couldn't load rankings."));
    return () => { cancelled = true; };
  }, []);

  if (error)
    return <div style={{ padding: 16, background: "rgba(232,96,76,0.15)", border: `1px solid ${C.red}`, borderRadius: 4, fontSize: 14 }}>{error}</div>;
  if (!rows)
    return <div style={{ textAlign: "center", padding: 60, color: C.mute, fontSize: 15 }}>Loading ladder rankings...</div>;

  const cell = { padding: "10px 8px", fontSize: 13, fontFamily: "ui-monospace, monospace" };
  const head = { ...cell, color: C.mute, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid rgba(245,242,232,0.15)" };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
        <thead>
          <tr>
            <th style={{ ...head, width: 44 }}>Rank</th>
            <th style={head}>Player</th>
            <th style={{ ...head, textAlign: "center" }}>W</th>
            <th style={{ ...head, textAlign: "center" }}>L</th>
            <th style={{ ...head, textAlign: "center" }}>Streak</th>
            <th style={{ ...head, textAlign: "center" }}>Move</th>
            <th style={head}>Challenge</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.rank} style={{ borderBottom: "1px solid rgba(245,242,232,0.08)" }}>
              <td style={{ ...cell, color: C.ball, fontWeight: 700 }}>#{r.rank}</td>
              <td style={cell}>
                {r.teamId ? (
                  <button
                    onClick={() => onPlayer({ name: r.name, teamId: r.teamId })}
                    style={{ background: "none", border: "none", color: C.line, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, textAlign: "left", textDecoration: "underline", textDecorationColor: "rgba(245,242,232,0.25)" }}
                  >
                    {r.name}
                  </button>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</span>
                )}
              </td>
              <td style={{ ...cell, textAlign: "center", color: C.ball }}>{r.wins}</td>
              <td style={{ ...cell, textAlign: "center", color: C.mute }}>{r.losses}</td>
              <td style={{ ...cell, textAlign: "center", color: (r.streak || "").startsWith("W") ? C.ball : (r.streak || "").startsWith("L") ? C.red : C.mute }}>{r.streak}</td>
              <td style={{ ...cell, textAlign: "center" }}><MovementArrow m={r.movement} /></td>
              <td style={{ ...cell, fontSize: 12, color: C.mute }}>{r.challenge}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 16, color: C.mute, fontSize: 13, textAlign: "center" }}>
        {rows.length} players · ladder record · tap a name for their full report
      </div>
    </div>
  );
}

// ---------- CONTACTS VIEW ----------
function Contacts() {
  const [contacts, setContacts] = useState(CONTACTS_FALLBACK);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(!!CONTACTS_CSV_URL);

  useEffect(() => {
    if (!CONTACTS_CSV_URL) return;
    let cancelled = false;
    fetch(CONTACTS_CSV_URL)
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.text();
      })
      .then((t) => {
        if (cancelled) return;
        const parsed = parseContactsCsv(t);
        if (parsed.length) setContacts(parsed);
      })
      .catch(() => {
        // keep the bundled fallback list
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name..."
        style={{ width: "100%", boxSizing: "border-box", background: C.clay, border: "1px solid rgba(245,242,232,0.2)", borderRadius: 4, color: C.line, padding: "12px 14px", fontSize: 15, marginBottom: 16 }}
      />
      <div style={{ background: "rgba(15,46,37,0.6)", border: "1px solid rgba(245,242,232,0.15)", borderRadius: 4, overflow: "hidden" }}>
        {filtered.map((c, i) => (
          <div
            key={c.name}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(245,242,232,0.08)" : "none", flexWrap: "wrap" }}
          >
            <div style={{ flex: "1 1 160px", fontSize: 15, fontWeight: 600, color: C.line }}>
              {c.name}
              {c.rating && (
                <span style={{ fontSize: 12, color: C.mute, fontWeight: 400, marginLeft: 8 }}>{c.rating}</span>
              )}
            </div>
            {c.phone && (
              <a href={`tel:${c.phone.replace(/[^0-9]/g, "")}`} style={{ flex: "0 0 auto", fontFamily: "ui-monospace, monospace", fontSize: 14, color: C.ball, textDecoration: "none" }}>
                {c.phone}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} style={{ flex: "1 1 200px", fontSize: 13, color: C.mute, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.email}
              </a>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: C.mute, textAlign: "center", padding: 40 }}>No one matches "{q}".</div>
        )}
      </div>
      <div style={{ marginTop: 16, color: C.mute, fontSize: 13, textAlign: "center" }}>
        {loading ? "Loading latest from the sheet..." : `${contacts.length} players · tap a number to call, tap an email to message`}
      </div>
    </>
  );
}

// ---------- APP ----------
function App() {
  const [tab, setTab] = useState("players"); // "players" | "contacts"
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("teamId");
    if (tid) {
      const player = ROSTER.find((p) => p.teamId === tid) || { name: "", teamId: tid };
      openPlayer(player, false);
    }
  }, []);

  const openPlayer = async (player, pushUrl = true) => {
    setSelected(player);
    setStats(null);
    setError("");
    setLoading(true);
    if (pushUrl) {
      const u = new URL(window.location);
      u.searchParams.set("teamId", player.teamId);
      window.history.pushState({}, "", u);
    }
    try {
      const r = await fetch(`/api/fetch-log?url=${encodeURIComponent(logUrl(player.teamId))}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Fetch failed");
      const ms = parseLog(htmlToRows(data.html));
      if (ms.length < 2) throw new Error("No match history found for this player yet.");
      setStats(computeStats(ms));
    } catch (e) {
      setError(e.message || "Couldn't load this player's matches.");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setSelected(null);
    setStats(null);
    setError("");
    const u = new URL(window.location);
    u.searchParams.delete("teamId");
    window.history.pushState({}, "", u);
  };

  const filtered = ROSTER.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: C.court, fontFamily: "system-ui, -apple-system, sans-serif", color: C.line }}>
      <div style={{ height: 6, background: `repeating-linear-gradient(90deg, ${C.line} 0 40px, transparent 40px 80px)`, opacity: 0.25 }} />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 64px" }}>
        <header style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { setTab("players"); goHome(); }}>
          <Logo />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>Rally Report</h1>
            <div style={{ color: C.mute, fontSize: 13 }}>FXBG Tennis Ladder</div>
          </div>
        </header>

        {/* TOP NAV */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid rgba(245,242,232,0.15)" }}>
          {[["players", "Players"], ["rankings", "Rankings"], ["contacts", "Contacts"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => { setTab(k); if (k === "players") goHome(); }}
              style={{
                background: "none", border: "none", padding: "10px 18px", cursor: "pointer",
                fontSize: 15, fontWeight: 700,
                color: tab === k ? C.ball : C.mute,
                borderBottom: tab === k ? `2px solid ${C.ball}` : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "rankings" && (
          <Rankings
            onPlayer={(p) => { setTab("players"); openPlayer(p); }}
          />
        )}

        {tab === "contacts" && <Contacts />}

        {tab === "players" && !selected && (
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              style={{ width: "100%", boxSizing: "border-box", background: C.clay, border: "1px solid rgba(245,242,232,0.2)", borderRadius: 4, color: C.line, padding: "12px 14px", fontSize: 15, marginBottom: 16 }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {filtered.map((p) => (
                <button
                  key={p.teamId}
                  onClick={() => openPlayer(p)}
                  style={{ textAlign: "left", background: "rgba(15,46,37,0.6)", border: "1px solid rgba(245,242,232,0.15)", borderRadius: 4, padding: "14px 16px", color: C.line, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.ball)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(245,242,232,0.15)")}
                >
                  {p.name}
                  <span style={{ color: C.ball, fontSize: 18 }}>›</span>
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ color: C.mute, textAlign: "center", padding: 40 }}>No players match "{search}".</div>
            )}
            <div style={{ marginTop: 24, color: C.mute, fontSize: 13, textAlign: "center" }}>
              {ROSTER.length} players · click any name for their full scouting report
            </div>
          </>
        )}

        {tab === "players" && selected && (
          <>
            <button
              onClick={goHome}
              style={{ background: "none", border: `1px solid ${C.mute}`, color: C.line, borderRadius: 4, padding: "8px 16px", fontSize: 14, cursor: "pointer", marginBottom: 20 }}
            >
              ‹ All players
            </button>

            {loading && (
              <div style={{ textAlign: "center", padding: 60, color: C.mute, fontSize: 15 }}>
                Loading {selected.name}'s match log...
              </div>
            )}

            {error && (
              <div style={{ padding: 16, background: "rgba(232,96,76,0.15)", border: `1px solid ${C.red}`, borderRadius: 4, fontSize: 14 }}>
                {error}
              </div>
            )}

            {stats && <Report stats={stats} name={selected.name} />}
          </>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
