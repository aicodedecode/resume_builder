# Resume Builder

A fully client-side resume builder that supports:

- Real-time resume preview.
- Automatic saving with `localStorage`.
- PDF download using `html2canvas` + `jsPDF`.
- Free usage with no login and no backend.

## Project Structure

```text
resume_builder/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run Locally

Open `index.html` directly in your browser, or use a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy on GitHub Pages (Step-by-Step)

### 1) Create a GitHub repository
- On GitHub, create a new repository (for example: `resume-builder`).

### 2) Push your project files
Run these commands from the project folder:

```bash
git init
git add .
git commit -m "Initial commit: Resume Builder"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 3) Enable GitHub Pages
1. Open your repository on GitHub.
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Click **Save**.

### 4) Open your live site
- Wait 1–3 minutes for deployment.
- Your app will be available at:

```text
https://<your-username>.github.io/<repo-name>/
```

## Troubleshooting GitHub Pages

- If you get a 404 right after enabling Pages, wait a minute and refresh.
- Make sure `index.html` is in the repository root (not inside another folder).
- If your repo is private, ensure your GitHub plan supports Pages for private repos.

## Notes

- The app uses public CDN links for `html2canvas` and `jsPDF`.
- All data stays in the browser using `localStorage`.
- No paid APIs or server-side services are required.
