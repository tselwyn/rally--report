# Rally Report

Paste a TennisRungs match log link → get a full scouting report: career record,
win rate by year, head-to-head, streaks, clutch stats, and auto-generated
coach's notes.

## How it works

- **Frontend:** React + Vite (`src/App.jsx`). All parsing and stats run in the browser.
- **Backend:** one serverless function (`api/fetch-log.js`) that fetches the
  match log page server-side. This is what makes link-pasting work — browsers
  block cross-site fetches (CORS), servers don't.

## Run locally

```bash
npm install
npx vercel dev     # runs frontend + the api/ function together
```

(`npm run dev` alone runs the frontend only — the link fetch needs `vercel dev`.)

## Deploy (free, ~5 minutes)

1. Push this folder to a GitHub repo
2. Go to vercel.com → Add New Project → import the repo
3. Vercel auto-detects Vite. Click Deploy.
4. Done — you get a live URL like `rally-report.vercel.app`. Custom domain optional.

Or from the command line: `npx vercel --prod`

## Extending it

- **More ladder sites:** add their hostnames to the allowlist in
  `api/fetch-log.js` and (if their page format differs) adjust `htmlToRows()` /
  `ROW_RE` in `src/App.jsx`.
- **Shareable reports:** encode the teamId in the URL (`?teamId=...`) and
  auto-load on page open, so players can share their report link.
