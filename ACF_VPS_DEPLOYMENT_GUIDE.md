# ACF APR — Production Deployment Guide (GitHub → Fresh Ubuntu VPS)

This guide deploys the **ACF APR** application to a fresh Ubuntu VPS and serves it over the
VPS public IP address — **no domain name and no SSL/HTTPS for now** (HTTPS can be added later
once a domain is available; see section 22).

- Frontend (Next.js): `http://YOUR_VPS_IP:3000`
- Backend API (Laravel): `http://YOUR_VPS_IP:8000/api`
- Excel download service (Python): `http://YOUR_VPS_IP:5000`
- Source repository: `https://github.com/seDiqj/ACF_APR_FINAL.git`

> Replace every `YOUR_VPS_IP`, `YOUR_STRONG_DB_PASSWORD`, `YOUR_STRONG_ADMIN_PASSWORD`,
> `YOUR_APP_USER`, and `YOUR_APP_GROUP` below with your real values. **Never commit real
> passwords.**

Throughout this guide:

- **`[ROOT]`** = run as `root` (or with `sudo`).
- **`[APP USER]`** = run as the dedicated application user (e.g. `acf`).
- **`[PROJECT]`** = run inside the project directory, as the application user.

---

## 1. VPS Requirements

| Component | Required version |
|-----------|------------------|
| Ubuntu | 22.04 LTS or 24.04 LTS (64-bit) |
| PHP | 8.2 or higher (8.4 recommended) — CLI + FPM |
| Node.js | 20.9+ (the guide installs Node 22) |
| MySQL | 8.0 or MariaDB 10.6+ |
| Python | 3.10+ |
| Composer | 2.x |
| Git | any recent version |

Required PHP extensions (used by Laravel and its dependencies):

```text
pdo_mysql, mbstring, xml, ctype, json, tokenizer, openssl, curl, fileinfo, bcmatch? (not required), zip, gd (optional)
```

The minimum set that must be present: **`pdo_mysql`, `mbstring`, `xml`, `ctype`, `json`,
`tokenizer`, `openssl`, `curl`, `fileinfo`**.

Python dependency (Excel service): **`openpyxl`** (plus the Python standard library, which is
always present).

Other requirements:

- Outbound internet access from the VPS (needed to clone the repo, run `composer install`,
  `npm install`, and — **only during the frontend build** — to fetch Google Fonts for
  `next/font/google`).
- The machine running `npm install`/`npm run build` needs a working Node toolchain.

---

## 2. SSH Connection

From your computer:

```bash
ssh root@YOUR_VPS_IP
```

If you use a key pair, pass the key:

```bash
ssh -i /path/to/your_key.pem root@YOUR_VPS_IP
```

If SSH times out, check that the VPS provider firewall panel allows inbound SSH (port 22).

---

## 3. Server Preparation and Required Packages

**[ROOT]** Update the system and install the base toolchain:

```bash
apt update
apt upgrade -y
apt install -y git curl unzip zip wget
```

Install PHP and required extensions (adjust to the PHP version available on your distro;
this example uses PHP 8.3 via the `ondrej/php` PPA on Ubuntu):

```bash
apt install -y software-properties-common
add-apt-repository -y ppa:ondrej/php
apt update
apt install -y php8.3-cli php8.3-mbstring php8.3-xml php8.3-curl \
  php8.3-mysql php8.3-zip php8.3-gd php8.3-bcmath php8.3-fpm
php -v
```

Install Composer (if not already present):

```bash
curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
composer --version
```

> If `apt` fails because of broken/unconfigured mail packages (e.g. `exim4`), fix or purge the
> mail package first (from the provider console if needed), then re-run `apt`.

Install Node.js 22 (manual install, no `apt`):

```bash
mkdir -p /opt/acf-node
curl -fL https://nodejs.org/dist/v22.12.0/node-v22.12.0-linux-x64.tar.xz -o /tmp/node.tar.xz
tar -xJf /tmp/node.tar.xz -C /opt/acf-node --strip-components=1
export PATH=/opt/acf-node/bin:$PATH
node -v
npm -v
```

> To make `/opt/acf-node/bin` permanent for your shell, add it to the application user's
> profile (see section 8).

Install Python and the Excel service dependency:

```bash
apt install -y python3 python3-pip
pip3 install openpyxl
```

Verify:

```bash
python3 -c "import openpyxl; print(openpyxl.__version__)"
```

---

## 4. MySQL Setup

**[ROOT]** Create the database, the application user, and grant privileges:

```bash
mysql -u root -p
```

At the `mysql>` prompt:

```sql
CREATE DATABASE IF NOT EXISTS ACF_APR_FINAL CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'acf_apr_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_DB_PASSWORD';
GRANT ALL PRIVILEGES ON ACF_APR_FINAL.* TO 'acf_apr_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Or, from the shell (single command):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ACF_APR_FINAL CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'acf_apr_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_DB_PASSWORD'; GRANT ALL PRIVILEGES ON ACF_APR_FINAL.* TO 'acf_apr_user'@'localhost'; FLUSH PRIVILEGES;"
```

### Where the database credentials go

The credentials are written into the Laravel backend `.env` file, in the `DB_*` variables
(section 6). The values you created here:

| .env variable | Value |
|---------------|-------|
| `DB_DATABASE` | `ACF_APR_FINAL` |
| `DB_USERNAME` | `acf_apr_user` |
| `DB_PASSWORD` | `YOUR_STRONG_DB_PASSWORD` |
| `DB_HOST` | `127.0.0.1` |
| `DB_PORT` | `3306` |

---

## 5. Clone the Project

**[ROOT]** Create the application user and the project directory:

```bash
useradd -m -s /bin/bash acf
mkdir -p /var/www
cd /var/www
rm -rf acf
git clone https://github.com/seDiqj/ACF_APR_FINAL.git acf
chown -R acf:acf /var/www/acf
```

Expected folders inside `/var/www/acf`:

```text
aah_apr_back_end-master
aah_apr_front_end-master
excel_package_for_apr_download
ACF_VPS_DEPLOYMENT_GUIDE.md
```

---

## 6. Backend Setup (Laravel)

**[PROJECT]** `cd /var/www/acf/aah_apr_back_end-master`

### 6.1 Install Composer dependencies

```bash
composer install --no-dev --optimize-autoloader
```

### 6.2 Configure `.env`

**[PROJECT]** Create `.env` (the file is git-ignored; it is never committed):

```bash
cat > .env <<'EOF'
APP_NAME=ACF
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://YOUR_VPS_IP:8000
FRONTEND_URL=http://YOUR_VPS_IP:3000

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ACF_APR_FINAL
DB_USERNAME=acf_apr_user
DB_PASSWORD=YOUR_STRONG_DB_PASSWORD

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null
SANCTUM_STATEFUL_DOMAINS=YOUR_VPS_IP:3000,YOUR_VPS_IP:8000

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
# Must be HIGHER than the longest queued job timeout (GenerateApr is 120s),
# otherwise long-running jobs can be released and executed twice.
DB_QUEUE_RETRY_AFTER=190

CACHE_STORE=database

# Bootstrap admin account password for `php artisan db:seed --force`.
# REQUIRED - if it is missing, a random password is generated and printed during seeding.
SEED_ADMIN_PASSWORD=YOUR_STRONG_ADMIN_PASSWORD

MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

# Reverb is NOT required in this deployment (BROADCAST_CONNECTION=log).
# The frontend safely skips WebSocket connections when the key is empty.
REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=

VITE_APP_NAME="${APP_NAME}"
EOF
```

> **Critical:** `DB_PASSWORD` must match the password you set in section 4.
> `SEED_ADMIN_PASSWORD` must be a strong unique password; it is the password of the
> bootstrap admin account (`developer@developer.com`) created by the seeder.
> `DB_QUEUE_RETRY_AFTER=190` **must stay** — it is higher than the longest queued job
> (`GenerateApr` has a 120s timeout) so long jobs are never released and executed twice.

### 6.3 Generate the APP_KEY

```bash
php artisan key:generate --force
```

### 6.4 Run migrations and seeding

```bash
php artisan migrate --force
php artisan db:seed --force
```

`db:seed --force` creates:

- departments, users, roles, permissions, provinces, districts, kits, databases,
  indicator types, ISP3, questions, sectors;
- the bootstrap admin user `developer@developer.com` with the password from
  `SEED_ADMIN_PASSWORD`.

### 6.5 Cache configuration

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

> Do **not** run `config:cache` again while editing `.env`; if you change `.env`, re-run
> `php artisan config:clear && php artisan config:cache`.

### 6.6 Storage link and permissions

```bash
php artisan storage:link
```

**[ROOT]** Ensure the web/worker user can write to storage and bootstrap cache:

```bash
chown -R acf:acf /var/www/acf/aah_apr_back_end-master
chmod -R ug+rw /var/www/acf/aah_apr_back_end-master/storage
chmod -R ug+rw /var/www/acf/aah_apr_back_end-master/bootstrap/cache
```

---

## 7. Excel Service Setup (Python)

**[PROJECT]** `cd /var/www/acf/excel_package_for_apr_download`

The service is a single file: `server.py`. Its only third-party dependency is `openpyxl`
(already installed in section 3). Verify:

```bash
python3 -m py_compile server.py
python3 -c "import openpyxl; print('openpyxl OK')"
```

Run it in the foreground once to confirm it starts on port 5000:

```bash
python3 server.py
```

Then stop it (`Ctrl+C`) and proceed to section 13, where it is run persistently as a systemd
service.

---

## 8. Frontend Setup (Next.js)

**[PROJECT]** `cd /var/www/acf/aah_apr_front_end-master`

### 8.1 Install Node dependencies

```bash
export PATH=/opt/acf-node/bin:$PATH
npm install
```

### 8.2 Configure `.env.local`

The **`NEXT_PUBLIC_*` variables are baked into the build at build time**. Because there is no
domain, point them at the VPS public IP directly.

```bash
cat > .env.local <<'EOF'
NEXT_PUBLIC_API_BASE_URL=http://YOUR_VPS_IP:8000/api
NEXT_PUBLIC_EXCEL_API_BASE_URL=http://YOUR_VPS_IP:5000
NEXT_PUBLIC_REVERB_APP_KEY=
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
EOF
```

> - `NEXT_PUBLIC_API_BASE_URL` is the URL the browser uses to call the Laravel API. It **must**
>   be `http://YOUR_VPS_IP:8000/api` (no domain). All API calls (login, dashboard,
>   beneficiaries, APR, etc.) are relative to it.
> - `NEXT_PUBLIC_EXCEL_API_BASE_URL` is the URL of the Excel download service:
>   `http://YOUR_VPS_IP:5000`.
> - `NEXT_PUBLIC_REVERB_APP_KEY` is **empty** on purpose: the frontend then skips WebSocket
>   connections entirely (the app does not require Reverb in this deployment).

### 8.3 Build the frontend

```bash
export PATH=/opt/acf-node/bin:$PATH
npm run build
```

> The build downloads Google Fonts (`next/font/google`) from `fonts.gstatic.com` — the VPS
> needs outbound internet during this step only. If the build fails with font/network errors,
> check connectivity, then re-run `npm run build`.

### 8.4 Start the production frontend (manual test)

```bash
export PATH=/opt/acf-node/bin:$PATH
npm run start -- --hostname 0.0.0.0 --port 3000
```

Confirm it serves, then stop it and proceed to section 13 (systemd).

---

## 9. Queue Setup

The application uses the **database queue driver** (`QUEUE_CONNECTION=database`). Background
jobs handled by the worker:

- `GenerateApr` — computes indicator targets/achievements when an APR is generated (timeout 120s).
- `AttachBeneficiariesToSession` — attaches beneficiaries to community-dialogue sessions.
- `AttachBeneficiariesToTrainingChapters` — attaches training chapters to beneficiaries.

Without the worker, **APRs are never calculated** and newly added beneficiaries never appear
in the APR. The worker must always be running.

### Why `DB_QUEUE_RETRY_AFTER=190` is required

Laravel’s database queue uses `retry_after` to decide when a job that has not finished is
released back onto the queue so it can be retried. The longest job here is `GenerateApr`,
which has a hard timeout of **120 seconds**. If `retry_after` were smaller than 120s, a
still-running `GenerateApr` job could be released and started a second time, causing duplicate
or racy APR writes. `DB_QUEUE_RETRY_AFTER=190` is therefore **greater than** the longest job
timeout, and the worker is started with `--timeout=180` (>= the job timeout, < retry_after),
which keeps the queue safe.

### Run the worker persistently

A systemd unit is created in section 13 (`acf-queue`). To run it manually in the foreground:

```bash
php artisan queue:work --sleep=3 --tries=3 --max-time=3600 --timeout=180
```

---

## 10–13. systemd Services (backend, queue, frontend, excel)

**[ROOT]** Create the four unit files below.

### `acf-backend.service` — Laravel backend on port 8000

```bash
cat > /etc/systemd/system/acf-backend.service <<'EOF'
[Unit]
Description=ACF Laravel Backend
After=network.target mysql.service

[Service]
Type=simple
WorkingDirectory=/var/www/acf/aah_apr_back_end-master
ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000 --no-reload
Restart=always
RestartSec=5
User=acf
Group=acf

[Install]
WantedBy=multi-user.target
EOF
```

### `acf-queue.service` — Laravel queue worker

```bash
cat > /etc/systemd/system/acf-queue.service <<'EOF'
[Unit]
Description=ACF Laravel Queue Worker
After=network.target mysql.service acf-backend.service

[Service]
Type=simple
WorkingDirectory=/var/www/acf/aah_apr_back_end-master
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --max-time=3600 --timeout=180
Restart=always
RestartSec=5
User=acf
Group=acf

[Install]
WantedBy=multi-user.target
EOF
```

### `acf-frontend.service` — Next.js on port 3000

```bash
cat > /etc/systemd/system/acf-frontend.service <<'EOF'
[Unit]
Description=ACF Next.js Frontend
After=network.target acf-backend.service

[Service]
Type=simple
WorkingDirectory=/var/www/acf/aah_apr_front_end-master
Environment=PATH=/opt/acf-node/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=/opt/acf-node/bin/npm run start -- --hostname 0.0.0.0 --port 3000
Restart=always
RestartSec=5
User=acf
Group=acf

[Install]
WantedBy=multi-user.target
EOF
```

### `acf-excel.service` — Python Excel service on port 5000

```bash
cat > /etc/systemd/system/acf-excel.service <<'EOF'
[Unit]
Description=ACF APR Excel Download Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/acf/excel_package_for_apr_download
ExecStart=/usr/bin/python3 /var/www/acf/excel_package_for_apr_download/server.py
Restart=always
RestartSec=5
User=acf
Group=acf

[Install]
WantedBy=multi-user.target
EOF
```

> `User=acf` / `Group=acf` — the application user. If you created a different user, change
> both here. The backend, queue and frontend must run as a user with read access to
> `/var/www/acf` and write access to Laravel `storage/` and `bootstrap/cache/`.

---

## 14. Starting, Stopping, Restarting, Checking Services

**[ROOT]**

Start all services and enable them to start on boot:

```bash
systemctl daemon-reload
systemctl enable --now acf-backend
systemctl enable --now acf-queue
systemctl enable --now acf-frontend
systemctl enable --now acf-excel
```

Status of every service:

```bash
systemctl status acf-backend --no-pager
systemctl status acf-queue --no-pager
systemctl status acf-frontend --no-pager
systemctl status acf-excel --no-pager
```

Stop / start / restart a single service:

```bash
systemctl stop acf-backend
systemctl start acf-backend
systemctl restart acf-backend
```

Stop / start / restart all:

```bash
systemctl stop acf-backend acf-queue acf-frontend acf-excel
systemctl start acf-backend acf-queue acf-frontend acf-excel
systemctl restart acf-backend acf-queue acf-frontend acf-excel
```

View logs:

```bash
journalctl -u acf-backend -n 200 --no-pager -f
journalctl -u acf-queue -n 200 --no-pager -f
journalctl -u acf-frontend -n 200 --no-pager -f
journalctl -u acf-excel -n 200 --no-pager -f
```

Laravel application log:

```bash
tail -f /var/www/acf/aah_apr_back_end-master/storage/logs/laravel.log
```

Troubleshooting a failed service:

```bash
systemctl status acf-backend --no-pager          # shows the failing state
journalctl -u acf-backend -n 100 --no-pager      # shows the error
systemctl cat acf-backend                        # shows the unit definition
```

Common causes: wrong PHP binary path, wrong working directory, permissions on
`storage/`/`bootstrap/cache/`, wrong `.env`, or a port already in use. Fix and `systemctl
restart <service>`.

---

## 15. Firewall

Because there is **no domain**, the browser talks directly to the VPS IP. Open these TCP ports
and the reasons:

| Port | Service | Why it must be open |
|------|---------|---------------------|
| **3000** | Next.js frontend | The browser loads the application from `http://YOUR_VPS_IP:3000`. |
| **8000** | Laravel backend | The browser calls the API at `http://YOUR_VPS_IP:8000/api` (CORS requests). |
| **5000** | Python Excel service | The browser POSTs the APR data to `http://YOUR_VPS_IP:5000/generate-excel`. |
| **22** | SSH | You manage the VPS over SSH (usually already open). |

Open them with UFW:

```bash
ufw allow 22/tcp
ufw allow 3000/tcp
ufw allow 5000/tcp
ufw allow 8000/tcp
ufw enable
ufw status
```

> Also open TCP 3000/5000/8000 in the **VPS provider’s firewall/security group panel** (e.g.
> Hetzner, DigitalOcean, OVH), not only in the OS firewall. Both must allow the traffic.

---

## 16. Accessing the Application

From your computer’s browser:

- **Login / Dashboard / all screens:** `http://YOUR_VPS_IP:3000`
- Log in with the bootstrap admin: email `developer@developer.com`, password = the value you
  placed in `SEED_ADMIN_PASSWORD` (`YOUR_STRONG_ADMIN_PASSWORD`).

Because there is no domain, always use the IP. The frontend calls the API and the Excel
service at the same IP on ports 8000 and 5000.

---

## 17. CORS Configuration (no domain)

The Laravel backend only allows requests whose `Origin` header matches `FRONTEND_URL`. With no
domain:

- Set `FRONTEND_URL=http://YOUR_VPS_IP:3000` in the backend `.env` (this is the only origin
  the browser will send when loading the app from `http://YOUR_VPS_IP:3000`).
- Re-run `php artisan config:cache` after changing it.
- The Excel service sets `Access-Control-Allow-Origin: *` in its responses, so no extra CORS
  setup is needed for it.

If you open the frontend from any other origin (e.g. `http://IP:3000` with a different
scheme/host/port), the browser will show CORS errors; keep the origin identical.

---

## 18. Frontend/Backend URL Configuration (no domain)

| Where | Variable | Value |
|-------|----------|-------|
| Backend `.env` | `APP_URL` | `http://YOUR_VPS_IP:8000` |
| Backend `.env` | `FRONTEND_URL` | `http://YOUR_VPS_IP:3000` |
| Backend `.env` | `SANCTUM_STATEFUL_DOMAINS` | `YOUR_VPS_IP:3000,YOUR_VPS_IP:8000` |
| Frontend `.env.local` | `NEXT_PUBLIC_API_BASE_URL` | `http://YOUR_VPS_IP:8000/api` |
| Frontend `.env.local` | `NEXT_PUBLIC_EXCEL_API_BASE_URL` | `http://YOUR_VPS_IP:5000` |
| Frontend `.env.local` | `NEXT_PUBLIC_REVERB_APP_KEY` | (empty) |

These values are written at build time into the frontend bundle and at cache time into the
backend config. If the IP changes, update both files, then rebuild/recache:

```bash
# backend
php artisan config:clear && php artisan config:cache
# frontend
npm run build && systemctl restart acf-frontend
```

---

## 19. Verifying the Complete System After Deployment

**[ROOT]** Quick health checks:

```bash
curl -I http://YOUR_VPS_IP:3000/login
curl http://YOUR_VPS_IP:5000/health
curl -I http://YOUR_VPS_IP:8000
ss -ltnp | grep -E ':3000|:5000|:8000'
```

Then, in the browser at `http://YOUR_VPS_IP:3000`:

1. **Login** — log in with `developer@developer.com` / your `SEED_ADMIN_PASSWORD`. You should
   reach the dashboard.
2. **Dashboard** — KPI cards, APR workflow chart, projects by status/province, and action
   queue load from `GET /api/dashboard/overview`.
3. **Beneficiary creation** — open *Main Database* → create a beneficiary (date of
   registration inside the project period). Confirm it appears in the list.
4. **APR workflow** — create/open a project with an indicator; add the beneficiary and link
   it to the indicator (sessions); submit the database; an approver approves it
   (`firstApproved`).
5. **APR generation** — click *Generate APR*. Status becomes *APR Generated*. Verify the
   indicator’s “achieved” value counts the beneficiary.
6. **Queue processing** — confirm the job ran: `php artisan queue:monitor` or check that the
   `jobs` table is empty:
   ```bash
   mysql -u acf_apr_user -p ACF_APR_FINAL -e "SELECT COUNT(*) FROM jobs; SELECT * FROM failed_jobs ORDER BY id DESC LIMIT 5;"
   ```
7. **Excel generation** — open the APR preview and click *Download Excel*; confirm the file
   downloads and shows the same totals as the screen.
8. **File/storage access** — upload a user photo in *User Management* and confirm the avatar
   loads from `http://YOUR_VPS_IP:8000/storage/...` (requires `storage:link`).
9. **Important API calls** — from the browser console you should see 2xx responses for
   `/api/authentication/login`, `/api/dashboard/overview`, `/api/global/...`, etc., and **no**
   `ERR_CONNECTION_REFUSED` / WebSocket errors (Reverb is disabled).

---

## 20. Checking Logs When Something Fails

Backend (Laravel):

```bash
tail -f /var/www/acf/aah_apr_back_end-master/storage/logs/laravel.log
journalctl -u acf-backend -n 200 --no-pager
```

Queue worker:

```bash
journalctl -u acf-queue -n 200 --no-pager
```

Frontend:

```bash
journalctl -u acf-frontend -n 200 --no-pager
```

Excel service:

```bash
journalctl -u acf-excel -n 200 --no-pager
```

Failed queued jobs (e.g. APR generation failed):

```bash
mysql -u acf_apr_user -p ACF_APR_FINAL -e "SELECT * FROM failed_jobs ORDER BY id DESC LIMIT 10;"
```

> `failed_jobs` stores the exception message for every job that failed after its retries.

---

## 21. Troubleshooting Common VPS Problems

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| **502 / connection refused on 3000/8000/5000** | Service not running or died | `systemctl status acf-frontend/backend/excel`; `journalctl -u <service> -n 50`; `ss -ltnp \| grep -E ':3000\|:5000\|:8000'` |
| **Frontend cannot reach backend** | Wrong `NEXT_PUBLIC_API_BASE_URL` or backend down | Check `.env.local`, rebuild; `curl -I http://YOUR_VPS_IP:8000` |
| **CORS errors in browser console** | `FRONTEND_URL` mismatch | Set `FRONTEND_URL=http://YOUR_VPS_IP:3000`, `php artisan config:cache` |
| **Queue not processing (APR never generated)** | `acf-queue` not running | `systemctl status acf-queue`; start it; check `jobs`/`failed_jobs` tables |
| **Excel service unavailable** | `acf-excel` down, `openpyxl` missing, or port 5000 closed | `systemctl status acf-excel`; `python3 -c "import openpyxl"`; firewall/panel ports |
| **Storage permission errors** | `storage/` not writable | `chown -R acf:acf /var/www/acf/... && chmod -R ug+rw storage bootstrap/cache` |
| **Database connection errors** | Wrong `DB_*` in `.env`, MySQL down, user missing | Verify `.env`, `systemctl status mysql`, test `mysql -u acf_apr_user -p -e "SHOW DATABASES;"` |
| **Environment variable problems** | `.env` changed after `config:cache` | `php artisan config:clear && php artisan config:cache` |
| **systemd service fails to start** | Wrong path/binary/permissions/user | `systemctl cat <service>`; `journalctl -u <service> -n 100`; fix and restart |
| **Port/firewall problems** | UFW and/or provider panel not open | `ufw allow 3000/tcp` (also 5000, 8000, 22) and open the same in the provider panel |
| **Login rejected / unknown admin password** | `SEED_ADMIN_PASSWORD` changed after seeding | Re-seed only the admin: `php artisan tinker --execute="App\Models\User::where('email','developer@developer.com')->update(['password'=>bcrypt('NEW_PASSWORD')]);"` |
| **Frontend build fails on fonts** | No outbound internet to `fonts.gstatic.com` during `npm run build` | Ensure outbound internet, then `npm run build` again |

---

## 22. HTTPS/Domain (Optional, Later)

This deployment uses plain HTTP on the VPS IP, which is fine for the first go-live. When you
have a domain:

1. Point the DNS `A` record to `YOUR_VPS_IP`.
2. Install a reverse proxy (Nginx or Caddy) that terminates TLS and proxies:
   - `/` → `127.0.0.1:3000`
   - `/api` → `127.0.0.1:8000/api`
   - `/generate-excel` → `127.0.0.1:5000`
3. Install the certificate (e.g. `certbot --nginx`).
4. Update `APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS` (backend) and
   `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_EXCEL_API_BASE_URL` (frontend) to the HTTPS domain,
   then recache/rebuild as described in section 18.

---

## Summary of the running services

| Service | Port | What it does |
|---------|------|--------------|
| `acf-backend` | 8000 | Laravel API |
| `acf-queue` | — | Laravel queue worker (APR generation etc.) |
| `acf-frontend` | 3000 | Next.js web app |
| `acf-excel` | 5000 | Excel download service (Python) |

After following sections 1–19 you should be able to open `http://YOUR_VPS_IP:3000`, log in,
create beneficiaries, submit databases, generate APRs (processed by the queue worker), and
download the Excel report.