# Home Page Overrides

> Overrides `MASTER.md` for `/` landing page.

## Typography

- **Do not load Google Fonts or any third-party font CDN.**
- Display: `"Songti SC", "STSong", Georgia, serif` via `--font-display`
- Body: system UI stack via `--font-sans`

## Motion

- Scroll-triggered section reveals (IntersectionObserver)
- Hero product frame: subtle float loop
- Hero mesh: slow ambient pulse
- All motion disabled under `prefers-reduced-motion`

## Accent

- Keep Claude terracotta `#D97757` for CTA (project brand), not MASTER gold.
