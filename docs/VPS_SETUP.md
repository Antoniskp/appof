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

Recommended (single line):
sudo apt install -y curl git build-essential ca-certificates

Or multi-line (copy exactly, including the trailing `\`):
sudo apt install -y \
  curl \
  git \
  build-essential \
  ca-certificates

---

## 4. Install Node.js (LTS)

If you see an older version like `v12.x` or `npm` is missing, remove the
distro-provided Node first:
sudo apt remove -y nodejs npm || true
sudo apt autoremove -y

Install Node 20 (LTS) from NodeSource:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

If `npm` is still missing, install it explicitly:
sudo apt install -y npm

Verify:
node -v
npm -v

---

## 5. Install pnpm

npm install -g pnpm

NoNOOOOOO
corepack enable
corepack prepare pnpm@latest --activate

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

ERRORS
sudo -u postgres psql <<EOF
CREATE USER news_user WITH PASSWORD 'change_me';
CREATE DATABASE news_db OWNER news_user;
EOF

NOTE:
- Replace password later with a secure value.
- Update .env accordingly.

---

## 8. Clone the repository

cd /srv
sudo git clone <REPO_URL> news-superapp
sudo chown -R $USER:$USER news-superapp
cd news-superapp

or for this repo :
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

### Troubleshooting: Prisma P1012 Error

If you encounter error P1012 ("DATABASE_URL environment variable not found"), this means Prisma cannot find the DATABASE_URL in its expected location.

**Root Cause:**
Prisma CLI reads environment variables from the directory where it's executed, NOT from the repository root. When running Prisma commands in apps/api, it looks for .env in apps/api/.

**Fix (Option A - Recommended):**

1. Ensure you are in the correct directory:
   ```
   cd /srv/appof/apps/api
   ```

2. Verify the .env file exists in apps/api:
   ```
   ls -la /srv/appof/apps/api/.env
   ```

3. If missing, create it from the example:
   ```
   cp /srv/appof/apps/api/.env.example /srv/appof/apps/api/.env
   nano /srv/appof/apps/api/.env
   ```

4. Ensure DATABASE_URL is set correctly:
   ```
   DATABASE_URL=postgresql://news_user:change_me@localhost:5432/news_db
   ```

5. Run the Prisma command from apps/api directory:
   ```
   pnpm prisma migrate deploy
   ```

**Important:** Always run Prisma commands from /srv/appof/apps/api, not from the repository root.

---

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
- On VPS: http://185.92.192.81:3000 (ensure port 3000 is open in firewall)

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
- /health endpoint responds with 200
- web homepage accessible on port 3000

---

## 15. Next steps (not yet implemented)

- systemd services
- reverse proxy (nginx)
- TLS
- firewall hardening
