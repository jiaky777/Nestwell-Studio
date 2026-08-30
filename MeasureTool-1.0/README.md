# Curtain Measurement Tool

A local, offline clone of the [Curtarra measurement wizard](https://www.curtarra.com/pages/measurement-tool).
Walks the user through 7 steps and computes the fabric spec for a custom curtain order.

## Run

Just open [index.html](measurement-tool/index.html) in any modern browser — no build step, no server.

Or from PowerShell:

```powershell
Start-Process .\measurement-tool\index.html
```

If you prefer a local server (so the browser treats it as `http://`):

```powershell
python -m http.server 8000 -d .\measurement-tool
# then visit http://localhost:8000
```

## Steps

1. **Header Style** — Grommet, Rod Pocket, Pinch Pleat (Double / Triple), Back Tab, Tab Top, Flat Panel, Ripple Fold, Pencil Pleat. Selecting a style pre-fills its recommended fullness.
2. **Rod / Hardware** — Single, Double, Ceiling Track, Wand-Draw, Tension.
3. **Coverage Width** — Window width + extension per side → coverage width.
4. **Coverage Height** — Rod-to-floor + bottom style (floating ½", touching, break, puddle, or custom sill length) → finished length.
5. **Panel Quantity** — 1 / 2 / 3 / 4.
6. **Fullness** — 1.5× / 2× / 2.5× / 3×.
7. **Review** — Full spec table with **Print** and **Copy spec** actions.

## Calculations

```
coverage_width   = window_width + 2 × extension
finished_length  = rod_to_floor + bottom_offset       (or custom sill length)
total_fabric_w   = coverage_width × fullness
width_per_panel  = total_fabric_w / panels
```

A live summary panel on the right updates as you type. A unit toggle at the top switches the displayed unit between inches and centimeters.

## Files

- [index.html](measurement-tool/index.html) — markup & step layout
- [styles.css](measurement-tool/styles.css) — styling, responsive layout, print stylesheet
- [app.js](measurement-tool/app.js) — state, calculations, inline-SVG illustrations, wiring
