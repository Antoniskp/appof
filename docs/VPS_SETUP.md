# VPS_SETUP

This document describes the exact steps required to set up and run the project
on a fresh Ubuntu server. All commands are intended to be executed as a user
with sudo privileges.

Target OS:
- Ubuntu 22.04 or newer

This document is authoritative. Do not improvise commands outside this file.

---

## 0. Fix SSH runtime dir (prevents "Missing /run/sshd")
These steps ensure the SSH daemon has its runtime directory after boot and keeps
connections alive to avoid idle disconnects.
Create the runtime directory, persist it across reboots, and restart sshd:

mkdir -p /run/sshd
chmod 0755 /run/sshd
cat >/etc/tmpfiles.d/sshd.conf <<'EOF'
d /run/sshd 0755 root root -
EOF
systemd-tmpfiles --create
systemctl restart ssh


## 1. SSH keepalive
Configure keepalive settings and restart sshd:

cat >> /etc/ssh/sshd_config <<'EOF'
ClientAliveInterval 300
ClientAliveCountMax 5
TCPKeepAlive yes
EOF
systemctl restart ssh


Explanation:
- /run/sshd is required by sshd; tmpfiles recreates it on boot.
- ClientAliveInterval sends a keepalive every 300 seconds.
- ClientAliveCountMax disconnects after 5 missed keepalives.
- TCPKeepAlive enables TCP keepalive probes at the OS level.

---

## 2. System update
# If your VPS image includes Virtuozzo/OpenVZ repo, it can throw harmless 404s for Translation-en.
# Disable it for this project setup:

grep -RIn --line-number "repo\.virtuozzo\.com/ctpreset" /etc/apt/sources.list /etc/apt/sources.list.d || true
sudo sh -c 'grep -RIl "repo\.virtuozzo\.com/ctpreset" /etc/apt/sources.list /etc/apt/sources.list.d | while read -r f; do mv "$f" "$f.disabled"; done' || true

sudo apt update && sudo apt upgrade -y

---

## 3. Install base system dependencies
Run the install as a single command. If you break it across lines, make sure the
line-continuation `\` characters are included or the shell will try to execute
each package name as its own command.

sudo apt install -y curl git build-essential ca-certificates

---

## 4. Install Node.js (LTS)
Install Node 20 (LTS) from NodeSource:

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

Verify:
node -v
npm -v

---

## 5. Install pnpm

npm install -g pnpm

Verify:

pnpm -v

---

## 6. Install PostgreSQL

sudo apt install -y postgresql postgresql-contrib

Start and enable:
sudo systemctl enable postgresql
sudo systemctl start postgresql

Verify:
sudo systemctl status postgresql --no-pager

---

## 7. Create database and user

Correct / clean command (no warning)
Use -c instead of heredoc:

sudo -u postgres psql -c "CREATE USER news_user WITH PASSWORD 'change_me';"
sudo -u postgres psql -c "CREATE DATABASE news_db OWNER news_user;"

NOTE:
- Replace password later with a secure value.
- Update .env accordingly.

---

## 8. Clone the repository

cd /srv
sudo git clone <REPO_URL> news-superapp
sudo chown -R $USER:$USER news-superapp
cd news-superapp

OR for this repo :
cd /srv
git clone https://github.com/Antoniskp/appof.git
cd appof


---

## 9. Environment configuration

Install nano

sudo apt update
sudo apt install -y nano

Create environment files (from repo root):
cd /srv/appof
cp .env.example .env
cp apps/api/.env.example apps/api/.env

Edit the root .env:
nano .env

Edit the API .env (Prisma reads from apps/api when running migrations):
nano apps/api/.env

Required variables (example): Change changeme to the password you used at step 7
DATABASE_URL=postgresql://news_user:change_me@localhost:5432/news_db
API_PORT=4000
WEB_PORT=3000
NODE_ENV=production

To save and exit nano
Ctr+o, enter, ctrl+x
---

## 10. Install dependencies

pnpm install

---

## 11. Database migrations
Ensure /srv/appof/apps/api/.env exists (from step 9) so Prisma can load DATABASE_URL.

cd /srv/appof/apps/api
pnpm prisma migrate deploy


## 12. Build applications

make build

Expected:
- apps/api builds successfully
- apps/web builds successfully

---

## 13. Run in production (temporary foreground test)

API:
cd apps/api
pnpm start

In another shell:
curl http://localhost:4000/health

Expected:
HTTP 200
{ "status": "ok" }

Stop API with Ctrl+C.

Web:
cd apps/web
pnpm start

The Next.js app will start on port 3000.

Access the homepage:
- Locally: http://localhost:3000
- On VPS: http://YOUR_SERVER_IP:3000 (replace YOUR_SERVER_IP with your actual server IP; ensure port 3000 is open in firewall)

Expected:
Homepage displays "Appof Web – it works"

Stop web server with Ctrl+C.

---

## 14. Verification checklist

- node -v prints Node 20+
- pnpm -v prints version
- postgres is running
- pnpm install succeeds
- make build succeeds
- /health endpoint responds with 200 (test manually in foreground mode)
- web homepage accessible on port 3000 (test manually in foreground mode)

Note: The manual tests above are for initial verification. After setting up systemd services (section 15), the services will handle starting and restarting automatically.

---

## 15. Set up systemd services

The repository includes systemd unit files for both the API and web services. These files ensure the services start automatically on boot and restart on failure.

### Service Configuration Details

The systemd service files are configured with:
- **WorkingDirectory**: `/srv/appof` (repository root for pnpm workspace)
- **EnvironmentFile**: `/srv/appof/.env` (shared environment variables)
- **User/Group**: `www-data` (standard web service user)
- **HOME**: `/var/www` (required for pnpm to work properly)
- **ExecStart**: Uses `pnpm --filter` to run workspace-specific commands

### Copy systemd unit files:

sudo cp /srv/appof/infra/systemd/appof-api.service /etc/systemd/system/
sudo cp /srv/appof/infra/systemd/appof-web.service /etc/systemd/system/

### Ensure proper ownership:

The www-data user needs read access to the repository:

sudo chown -R www-data:www-data /srv/appof

### Reload systemd daemon to recognize new services:

sudo systemctl daemon-reload

### Enable services to start on boot:

sudo systemctl enable appof-api.service
sudo systemctl enable appof-web.service

### Start the services:

sudo systemctl start appof-api.service
sudo systemctl start appof-web.service

### Verify services are running:

sudo systemctl status appof-api.service --no-pager
sudo systemctl status appof-web.service --no-pager

Expected output: Both services should show "active (running)" status.

---

## 16. Service Management Commands

### Check service status:

sudo systemctl status appof-api.service --no-pager
sudo systemctl status appof-web.service --no-pager

### Start services:

sudo systemctl start appof-api.service
sudo systemctl start appof-web.service

### Stop services:

sudo systemctl stop appof-api.service
sudo systemctl stop appof-web.service

### Restart services (e.g., after code changes):

sudo systemctl restart appof-api.service
sudo systemctl restart appof-web.service

### View recent logs (last 50 lines):

sudo journalctl -u appof-api.service -n 50 --no-pager
sudo journalctl -u appof-web.service -n 50 --no-pager

### Follow logs in real-time:

sudo journalctl -u appof-api.service -f
sudo journalctl -u appof-web.service -f

### View logs since last boot:

sudo journalctl -u appof-api.service -b --no-pager
sudo journalctl -u appof-web.service -b --no-pager

---

## 17. Health Check and Verification

### Verify API health endpoint:

The API service exposes a `/health` endpoint on port 4000 (configurable via API_PORT in .env).

Test the health endpoint:

curl http://localhost:4000/health

Expected response:
{"status":"ok"}

With full HTTP response:

curl -i http://localhost:4000/health

Expected:
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"ok"}

### Verify web service:

The web service runs on port 3000 (configurable via WEB_PORT in .env).

Test locally:

curl http://localhost:3000

Or open in browser (replace YOUR_SERVER_IP with your actual server IP):

http://YOUR_SERVER_IP:3000

Expected: Homepage displays "Appof Web – it works"

### Complete verification checklist:

- [ ] API service is active: `sudo systemctl status appof-api.service --no-pager`
- [ ] Web service is active: `sudo systemctl status appof-web.service --no-pager`
- [ ] API health check passes: `curl http://localhost:4000/health`
- [ ] Web homepage loads: `curl http://localhost:3000`
- [ ] No errors in API logs: `sudo journalctl -u appof-api.service -n 20 --no-pager`
- [ ] No errors in web logs: `sudo journalctl -u appof-web.service -n 20 --no-pager`

---

## 18. Deployment Workflow (Update and Restart)

Below is a safe, repeatable update/deploy flow you can run on the VPS. This follows the VPS_SETUP.md conventions (pnpm, Prisma, make build).

### Assumptions:
- Repository is at /srv/appof
- You're on the default branch (likely main)
- You already have .env configured
- You want to pull latest code, apply DB migrations, rebuild, and restart services

### Update and deploy command:

cd /srv/appof && \
git fetch --all && \
git pull origin main && \
pnpm install && \
cd /srv/appof/apps/api && \
pnpm prisma migrate deploy && \
cd /srv/appof && \
make build && \
sudo systemctl restart appof-api.service && \
sudo systemctl restart appof-web.service && \
echo "Deployment complete - verifying services..." && \
sleep 2 && \
sudo systemctl is-active --quiet appof-api.service && \
sudo systemctl is-active --quiet appof-web.service && \
echo "✓ Both services are running"

### Verify deployment:

# Check services are running
sudo systemctl status appof-api.service --no-pager
sudo systemctl status appof-web.service --no-pager

# Verify API health
curl http://localhost:4000/health

# Check recent logs for errors
sudo journalctl -u appof-api.service -n 20 --no-pager
sudo journalctl -u appof-web.service -n 20 --no-pager

---

## 19. Nginx Reverse Proxy Setup (Optional)

To make the app available on the server IP (e.g., http://YOUR_SERVER_IP):

### Step 1: Stop/disable Apache (if running)

sudo systemctl stop apache2
sudo systemctl disable apache2

### Step 2: Install Nginx

sudo apt update
sudo apt install -y nginx

### Step 3: Ensure services are running

The systemd services should already be running from section 15. Verify:

sudo systemctl status appof-web.service --no-pager
curl -I http://localhost:3000

### Step 4: Configure Nginx reverse proxy

Replace YOUR_SERVER_IP with your actual server IP address:

sudo tee /etc/nginx/sites-available/appof >/dev/null <<'EOF'
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

### Step 5: Enable the site

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/appof /etc/nginx/sites-enabled/appof
sudo nginx -t
sudo systemctl restart nginx

### Step 6: Test from server

curl -I http://localhost

Expected: 200 OK and Next.js response (not Apache).

### Step 7: Test from browser

http://YOUR_SERVER_IP

You should see "Appof Web – it works".

---

## 20. Next Steps (Future Enhancements)

- TLS/SSL certificate setup (Let's Encrypt)
- Firewall hardening (ufw/iptables)
- Monitoring and alerting
- Automated backups
