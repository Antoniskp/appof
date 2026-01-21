# RUNBOOK

## Mandatory workflow
1) Read docs/TASK_CURRENT.md and docs/STATE.md first.
2) Work only on the Task ID in TASK_CURRENT.md.
3) Before coding: write plan + files to change + test plan.
4) After coding: update docs/STATE.md and docs/TASKS.md.

## Fix Mode (mandatory)
If a command fails:
1) Paste the full error output (no paraphrasing).
2) Identify the failing command.
3) Give 1–3 root-cause hypotheses.
4) Apply the smallest fix.
5) Re-run only the failing command.
After 3 failed attempts: stop coding and write a Debug Report.
