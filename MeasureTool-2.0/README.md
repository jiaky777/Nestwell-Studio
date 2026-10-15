# NestWell Studio Curtain Measuring Tool

A dependency-free measuring wizard for determining curtain width and finished length. The tool runs entirely in the browser and follows the visual direction in [DesignStyle.md](DesignStyle.md).

## Run

Open `index.html` directly in a modern browser, or serve the repository root:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/MeasureTool-2.0/`.

## Measurement Flow

1. Choose Double Pleat, Grommet, Single Pleat, Rod Pocket, Back Tab, or Four-Claw Hook.
2. Enter an installed rod or track width, or estimate it from the window width plus a total extension of 12 or 16 inches.
3. Measure the height from the **top of the rod to the floor**, then choose a finish on the same page: 1/2 inch Above Floor, Kiss Floor, or 2 inch Puddle. Original room illustrations show each hem effect; their proportions are illustrative.
4. Choose fullness. Double Pleat uses a fixed 2× ratio; the other headings support 1.5×, 1.8×, and 2×.
5. Choose one or two panels, then review the measurements. There is no separate Length step.

The height and finish are both required. Forward navigation revalidates earlier steps, including when editing previously completed measurements. The review screen supports printing, copying the specification, naming and saving all measurements as an XML file, editing, and starting over.

## Formulas

```text
rod_width = measured_rod_width
rod_width = window_width + selected_total_extension

total_fabric_width = rod_width × fullness
panel_width = total_fabric_width ÷ panel_count
finish_adjustment = -0.5 inches (Above Floor), 0 (Kiss Floor), or +2 inches (Puddle)
heading_adjustment = +2 inches for Grommet Top, otherwise 0
final_curtain_length = rod_to_floor_height + finish_adjustment + heading_adjustment
```

Dimensions are stored internally in inches. Changing the unit converts displayed and entered dimensions without changing the underlying physical measurements. The finish offsets are exactly -1.27, 0, and +5.08 centimeters. Grommet Top curtains retain the extra 2-inch (5.08-centimeter) fabric allowance above the rod, independently of the chosen floor finish. Other headings receive no additional correction. A final length of zero or less is not accepted.

Live estimates, review/print, copied specifications, and XML exports include the measured height, selected finish, and final length. Review and exports also include the finish adjustment and any Grommet adjustment.

### XML format

New exports use version `2.0`. In the `length` element, the previous `measuredCurtainLength` field is replaced with `rodToFloorHeight` and `measurementMethod` (`rod-top-to-floor`), because the input now always uses the rod top as its reference. `finishStyle` includes a stable `id` (`above-floor`, `kiss-floor`, or `puddle`), and `finishAdjustment` records the signed offset. `headingAdjustment` and `finalCurtainLength` are retained. Dimensions use the selected display unit.

## Validation

Run the dependency-free calculation and validation tests:

```bash
node --test MeasureTool-2.0/tests/measurement.test.js
```

In the browser, check both width methods, all three finishes, unit switching, back/progress navigation, review/edit/reset, and the copy/XML/print outputs. Check Measure Height on desktop and mobile.

## Files

- `index.html` contains the semantic wizard and review markup.
- `styles.css` provides the responsive NestWell visual system and print layout.
- `app.js` manages state, validation, calculations, unit conversion, and rendering, including the original SVG room and finish illustrations.
- `DesignStyle.md` documents the brand direction.