---
name: analyze-outreach
description: Run the Enlista WhatsApp outreach A/B analysis. Queries Supabase and prints a ranked report of all 4 variants by reply rate, click rate, and signup rate.
---

Run the outreach analysis:

1. Use the Bash tool to run:
   ```bash
   npm run outreach:analyze
   ```

2. The report is printed to the terminal and saved to `docs/outreach/reports/`.

3. If a variant is flagged for pausing, report it clearly to the user and ask whether to pause it.
