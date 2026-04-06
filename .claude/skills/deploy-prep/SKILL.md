# deploy-prep

Pre-deploy checklist before shipping to production.

## Trigger
"deploy", "ship", "push to production", "is this ready", or any deploy-related request.

## Checklist
1. Run `npm run build` — must pass with zero errors
2. Run `npm run lint` — must pass with zero warnings
3. Search for `console.log` — remove all instances
4. Search for `:any` type annotations — replace with proper types
5. Verify metadata in `layout.tsx`:
   - title is set
   - description is set
   - og:image if applicable
6. Check all internal links point to valid routes
7. Verify no TODO/FIXME/HACK comments remain
8. Confirm no hardcoded localhost URLs

## Output Format
```
[PASS] Build successful
[PASS] Lint clean
[FAIL] console.log found in src/app/page.tsx:12 → Remove
```

Final verdict: READY TO DEPLOY or BLOCKED (with list of failures)
