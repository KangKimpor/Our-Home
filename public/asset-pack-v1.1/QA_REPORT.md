# Asset Pack QA Summary — v1.1

- Total catalogue entries: 130
- New entries: 83
- Source screenshots included: 12

## Quality labels
- best_effort_cutout: 20
- composite_cutout: 31
- legacy_best_effort_cutout: 43
- reference_fragment: 36

## Validation checks
- All manifest paths are present.
- Transparent cutouts are PNG/RGBA; opaque reference crops preserve the original background.
- Full source screenshots are included without rescaling.
- Source crop coordinates are recorded for each new item.
- Screenshot-derived cutouts can retain line-art fragments or antialiasing defects; review before release.
- Tile samples are not guaranteed seamless.
