# NestWell Studio Curtain Measuring Tool

A dependency-free measuring wizard for determining curtain width and finished length. The tool runs entirely in the browser and follows the visual direction in [DesignStyle.md](DesignStyle.md).

## Run

Open `index.html` directly in a modern browser, or serve the repository root:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/MeasureTool-2.0/`.

## Measurement Flow

1. Enter an installed rod or track width, or estimate it from the window width plus a total extension of 12 or 16 inches.
2. Choose Double Pleat, Grommet, Single Pleat, Rod Pocket, Back Tab, or Four-Claw Hook.
3. Choose fullness. Double Pleat uses a fixed 2× ratio; the other headings support 1.5×, 1.8×, and 2×.
4. Choose one or two panels.
5. Follow the heading-specific guide and enter the finished curtain length.

The review screen supports printing, copying the specification, naming and saving all measurements as an XML file, editing, and starting over.

## Formulas

```text
rod_width = measured_rod_width
rod_width = window_width + selected_total_extension

total_fabric_width = rod_width × fullness
panel_width = total_fabric_width ÷ panel_count
grommet_final_length = measured_length + 2 inches
```

Dimensions are stored internally in inches. Changing the unit converts displayed and entered dimensions without changing the underlying physical measurements. Grommet Top curtains automatically receive a 2-inch (5.08-centimeter) finished-length adjustment.

## Files

- `index.html` contains the semantic wizard and review markup.
- `styles.css` provides the responsive NestWell visual system and print layout.
- `app.js` manages state, validation, calculations, unit conversion, and rendering.
- `DesignStyle.md` documents the brand direction.