# 3D Generalist Portfolio (portfolio2026)

Master industry portfolio with gallery home page and dedicated project detail pages.

## Categories

- **3D Models** — curated set including merged Dewata Masks (Barong + Rangda); excludes Wizard Cat and Fashion Mascot CNY
- **Moving Arts** — films hosted via YouTube embeds (placeholder URLs until you upload)
- **Product Physical Mockups** — all signage projects

## Project pages

Each project card links to:

`project.html?slug=your-project-slug`

Example: `http://localhost:8000/project.html?slug=dewata-masks-assets`

Slugs are defined in `scripts/portfolio.config.js`.

## Edit content

Update `scripts/portfolio.config.js`:

1. Profile: `profile.name`, `profile.role`, `profile.summary`
2. Per project: `title`, `slug`, `description`, `folder`, `cover`, `gallery`
3. **Dewata Masks** uses `assets: [{ folder, file }, ...]` for multi-folder media
4. **Moving Arts** — set `youtubeUrl` when ready (replace placeholder watch links):
   - `PLACEHOLDER_MORPH_FILM`
   - `PLACEHOLDER_PASAR_DEWATA_FILM`
5. **Sinatra** — add files to `3D MODELS/SINATRA SNOWGLOBE DIORAMA TRIBUTE`, then set `cover` and remove `mediaPending: true`

## YouTube videos

Moving Arts projects use `type: "youtube"` and `youtubeUrl`. Project pages show custom **Play / Pause / Mute / Unmute** controls (YouTube IFrame API). No local MP4 files are required for GitHub hosting.

Replace placeholder URLs like:

`https://www.youtube.com/watch?v=PLACEHOLDER_MORPH_FILM`

with your real video links after upload.

## Preview locally

```powershell
cd "D:\CURSOR FOLDERS\portfolio2026"
python -m http.server 8000
```

Open `http://localhost:8000`

## Git push

From this folder:

```powershell
git add .
git commit -m "Update portfolio"
git push
```

Large local MP4s in `MOVING ARTS/` are optional reference files; the site uses YouTube embeds instead.

## Cache busting

After edits, bump `?v=` on `styles.css` and script imports in `index.html` and `project.html`.
