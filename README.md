# Resume Builder — ATS-Friendly

A professional resume builder that runs entirely in your browser. Left-side editor, live resume preview, an ATS score checker, and a job-description keyword matcher — with one-click PDF export.

**100% private:** everything runs client-side and your data is stored only in your browser's `localStorage`. Nothing is ever uploaded anywhere.

## Features

- **Live editor + preview** — every keystroke updates the resume instantly
- **3 ATS-safe templates** — Classic (centered serif), Modern (subtle accent), Compact (one-page oriented)
- **ATS score checker** — 0–100 score with 11 pass/fail checks and specific fix advice:
  contact info, summary length (30–80 words), standard headings, bullets per role,
  action-verb openers, quantified achievements (numbers, %, ₹/$), no first-person
  pronouns, 1–2 page length, 8+ skills, consistent MM/YYYY dates, no "references" line
- **JD keyword matcher** — paste a job description, see matched vs. missing keywords to tailor your resume
- **Export** — Download PDF via the print dialog (A4, real selectable text), or Copy plain text for ATS portals
- **Autosave** to localStorage, **Load sample** (realistic Indian software-engineer example), **Clear all**
- Word/skill counters, responsive layout (stacks on mobile), sticky preview on desktop

## How to use

1. Open `index.html` in any browser (double-click works — no server needed) — that's the landing page; the builder itself lives at `builder.html`.
2. Fill in your details, add positions, education, projects, certifications.
3. Pick a template, watch the ATS score, paste a job description to check keyword overlap.
4. Click **Download PDF** → in the print dialog choose *Save as PDF* → name it `FirstName_LastName_Resume.pdf`.

## How it stays ATS-safe

Applicant-tracking systems parse resumes as text. Every template in this builder follows the rules parsers expect:

- **Single-column layout**, reverse-chronological order
- **Real, selectable text** — no images, icons, tables, text boxes, or progress bars in the resume
- **Standard headings exactly as parsers expect:** Professional Summary, Work Experience, Education, Skills, Projects, Certifications
- **Standard fonts** (Arial/Helvetica stack; Georgia for the Classic name), 10–12pt body
- **MM/YYYY dates**, `•` bullet characters, ≥0.6in print margins
- The PDF export is generated from the same live text (via `@media print`), so what the ATS reads is what you see

## Deploy

No build step — it's three static files.

**GitHub Pages:** push this folder to a repo → Settings → Pages → Deploy from branch → select `main` / root. Your builder is live at `https://<you>.github.io/<repo>/`.

**Vercel:** import the repo (or drag the folder into vercel.com) — it deploys as a static site with zero configuration.

## Files

| File | Purpose |
|---|---|
| `index.html` | Landing page: hero, features, how-it-works, templates, FAQ |
| `landing.css` | Landing page styles + motion system |
| `landing.js` | Landing page: reveals, hero gauge, FAQ accordion |
| `builder.html` | App shell: editor, preview, ATS + JD panels |
| `styles.css` | App UI, the 3 resume templates, `@media print` rules |
| `app.js` | Vanilla JS: state, rendering, ATS checks, JD matcher, export |

## License

MIT — free to use, modify, and share.
