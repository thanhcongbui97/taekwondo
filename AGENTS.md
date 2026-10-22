# AGENTS.md

## Repo overview

Static HTML/CSS/JS website for the **Taekwondo club at PTIT** (Posts and Telecommunications Institute of Technology, Vietnam). No build system, no package manager, no test framework, no CI.

- **Entry point:** `index.html` (homepage). Other pages: `bandieuhanh.html`, `ghepdoi.html`, `signup.html`, `spinwheel.html`, `thanhvien.html`, `vophuc.html`, `demo.html`.
- **Stack:** Bootstrap 4 + MDB (Material Design Bootstrap), jQuery 3.3.1, d3.js, Font Awesome. All vendored under `css/`, `js/`, `font/`.
- **Language:** Vietnamese (UTF-8). Some files show mojibake when read as Windows-1252 — see "Gotchas".

## Running / previewing

There is no dev server. To preview locally:

```powershell
# Option 1: open directly
start index.html

# Option 2: serve over HTTP (recommended; some features need a real origin)
python -m http.server 8000
# then visit http://localhost:8000
```

## Architecture notes

- **Shared header/footer** are custom elements `<my-header>` and `<my-footer>`, populated at runtime by `js/modules/header.js` and `js/modules/footer.js` (loaded with `defer`). If a page looks "naked", check that those two scripts are included before `</body>`.
- **Page-specific JS** lives in `js/modules/` (chart.js, enhanced-modals.js, forms-free.js, scrolling-navbar.js, waves.js, wow.js, etc.).
- **SCSS sources** are in `scss/` (MDB + custom `_custom-*.scss`). The compiled CSS in `css/` is what the HTML actually loads — do not edit `css/*.min.css` by hand; edit `scss/` and recompile if SCSS changes are needed.
- **XML files** (`demo.xml`, `info.xml`, `members.xml`, `text.xml`) are **Microsoft Excel spreadsheet exports** (Office Open XML / `Excel.Sheet` MIME), not data feeds. They contain member/contact info edited in Excel and re-saved.

## Gotchas

- **Encoding:** Several HTML/JS files contain Vietnamese text that displays as mojibake (`CA�u l���c b��T`) when read with the wrong encoding. The files are saved as UTF-8; the bytes are correct. If you see garbled text in your editor, switch the file encoding to UTF-8 — do not "fix" the characters.
- **Stray vim swap file:** `css/.bootstrap.css.swp` is a leftover editor swap file. Safe to delete; not referenced by anything.
- **No `.gitignore`:** Vendored assets, videos, and the swap file are all tracked. Be careful with `git add` / `git status` — large `videos/` directory is committed.
- **No build/lint/test commands exist.** Do not invent them. If a change needs verification, open the page in a browser.
- **Facebook SDK** is loaded inline in `index.html` with a hardcoded `appId` (`285078402724803`). Don't move it without checking auth-dependent features.
- **Favicon path** uses an absolute `/favicon.ico` — only resolves correctly when served from the site root, not when opening `index.html` via `file://` from a subfolder.

## Conventions

- HTML pages share the same `<head>` block (Font Awesome CDN, `css/bootstrap.min.css`, `css/mdb.min.css`, `css/style.css`). Keep new pages consistent with this template.
- Custom styles go in `css/style.css` (or `scss/_custom-styles.scss` if recompiling SCSS).
- Page content is in Vietnamese; preserve diacritics.
