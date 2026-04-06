# responsive-check

Audit responsive design for all pages or a specific page.

## Trigger
"check mobile", "responsive", "does this work on phone", or after completing any page.

## Checklist (320px viewport baseline)
1. No horizontal overflow or scroll on any element
2. Padding/margin uses responsive values (not fixed large px)
3. Font sizes minimum 16px on mobile (no tiny text)
4. Navigation is accessible on small screens
5. Images/media have max-width: 100%
6. Text content doesn't touch screen edges (min 16px side padding)
7. No fixed-width containers that exceed viewport
8. Flex/grid layouts wrap properly on narrow screens

## Output Format
Report each issue as:
```
[file:line] problem → fix
```

If all checks pass: "Responsive audit passed — no issues found."
