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

## Service Management (Production)

For production deployments on VPS, services are managed via systemd. See docs/VPS_SETUP.md for full setup instructions.

### Quick Reference - Service Commands:

Check status:
```bash
sudo systemctl status appof-api.service --no-pager
sudo systemctl status appof-web.service --no-pager
```

Start/stop/restart:
```bash
sudo systemctl start appof-api.service
sudo systemctl stop appof-api.service
sudo systemctl restart appof-api.service
```

View logs:
```bash
sudo journalctl -u appof-api.service -n 50 --no-pager
sudo journalctl -u appof-web.service -f  # follow in real-time
```

### Health Check:

Verify API is responding:
```bash
curl http://localhost:4000/health
```

Expected response: `{"status":"ok"}`

