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

---

## 9. Environment configuration

cp .env.example .env

Edit .env:
nano .env

Required variables (example):
DATABASE_URL=postgresql://news_user:change_me@localhost:5432/news_db
API_PORT=4000
WEB_PORT=3000
NODE_ENV=production

---

## 10. Install dependencies

pnpm install

---

## 11. Database migrations

pnpm -C apps/api prisma migrate deploy

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

---

## 14. Verification checklist

- node -v prints Node 20+
- pnpm -v prints version
- postgres is running
- pnpm install succeeds
- make build succeeds
- /health endpoint responds with 200

---

## 15. Next steps (not yet implemented)

- systemd services
- reverse proxy (nginx)
- TLS
- firewall hardening
