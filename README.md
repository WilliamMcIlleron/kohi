# Kōhī by Ifuku

Website for a café, micro-gallery and jazz *kissa* listening room at 44 Stanley,
Milpark, Johannesburg.

Static HTML, CSS and JavaScript. **No build step, no dependencies, no
`node_modules`** — deploying is `git push`. The asset pipeline in `tools/` is run
by hand, only when the source photography or typefaces change.

## Structure

```
index.html          Home — hero, statement, the room, the ritual, sessions, gallery, visit
menu.html           Menu (designed "coming soon" state — awaiting content)
gallery.html        17 photographs with a lightbox, plus 20 short films
404.html

assets/css/
  fonts.css         @font-face for the self-hosted subsets
  tokens.css        Design tokens — colour, type scale, spacing, motion
  base.css          Reset, typography, layout primitives
  components.css    Everything else
assets/js/site.js   Progressive enhancement only — every page works without it
assets/fonts/       Subset Fraunces + Inter
assets/img/         Responsive WebP derivatives
assets/video/       Re-encoded H.264

tools/              One-off asset pipeline (see below)
_headers            Cache + security headers (Netlify / Cloudflare Pages)
_redirects          Apex → www
```

## Design

The palette is sampled from the room itself: the near-black of a record sleeve,
the warm off-white of the plaster walls, the wood of the tables, and the indigo
of the *noren* curtain hanging over the counter.

Type is [Fraunces](https://fonts.google.com/specimen/Fraunces) for display and
[Inter](https://fonts.google.com/specimen/Inter) for interface text. Sections are
numbered `01`–`06` and set on a 12-column editorial grid that collapses to 6, then
to a single column.

`.is-dark` flips the semantic colour tokens, so any component dropped inside a
dark section resolves against it without needing its own variant.

## Performance

Every image is WebP with `srcset`/`sizes` and explicit `width`/`height`.
No video loads until asked for — the gallery clips fetch on click, and nothing
else on the site ships video at all.

The hero is a still, deliberately. Every clip in the library is fast-cut social
footage; the longest usable take runs about three seconds on a moving camera, so
a loop either jumps at the seam, boomerangs, or flashes a frame of the
neighbouring shot. A locked-off tripod shot of ten seconds or so would change
that — until there is one, the still is the honest choice.

| | Before | After |
|---|---|---|
| Image assets | 316 MB | 3.9 MB |
| Video assets | (included above) | 34 MB |
| Homepage weight | multi-MB | ~141 KB |
| Third-party requests | Google Fonts + review widget | none (map iframe is lazy) |

## Accessibility

Skip link, visible focus rings, landmarks, and a clean `h1 → h2 → h3` outline.
The mobile menu manages `aria-expanded`, locks background scroll, and closes on
`Escape`. The lightbox is a native `<dialog>`, so focus trapping and dismissal
come from the platform. All text meets WCAG AA against its background. Motion —
scroll reveals, the marquee, the spinning record — is disabled under
`prefers-reduced-motion`.

## Asset pipeline

Only needed when source media changes. Requires `ffmpeg` on `PATH`.

```bash
bash tools/build-images.sh
```

```bash
bash tools/build-video.sh
```

Fonts additionally need `fonttools` and `brotli`; install them into a throwaway
virtualenv rather than globally.

```bash
python tools/build-fonts.py
```

## Local preview

Any static server will do.

```bash
npx --yes serve --listen 5173 .
```
