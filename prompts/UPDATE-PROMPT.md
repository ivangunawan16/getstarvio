# Update HTML Files from Spec

Read these files first (in order):
1. `version 3.0/prompts/00-global.md`
2. `getstarvio-design-system.md`
3. The spec file for the page you're updating (e.g. `version 3.0/prompts/09-billing.md`)

Then read the current HTML file you're updating.

Update the HTML to match the spec. Do not change anything not mentioned in the spec. Use `str_replace` for targeted edits — only rebuild from scratch if the structure is fundamentally broken.

After updating, confirm what changed in 2–3 lines.
