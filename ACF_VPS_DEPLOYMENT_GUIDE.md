# ACF APR VPS Hosting Guide

Repository: `https://github.com/seDiqj/ACF_APR_FINAL.git`

Target VPS: `145.79.8.231`

This guide uses a safe first-hosting setup without a domain:

- Frontend: `http://145.79.8.231:3000`
- Backend API: `http://145.79.8.231:8000/api`
- APR Excel service: `http://145.79.8.231:5000`

This avoids disturbing the existing Apache service that was already using ports `80` and `443` on the VPS.

## 1. Server Notes From Inspection

The VPS previously showed:

- Ubuntu 24.04.3 LTS
- Apache already listening on `80` and `443`
- MySQL running
- PHP 8.4-FPM available
- Composer available at `/usr/local/bin/composer`
- Nginx installed but not suitable for `80/443` while Apache owns those ports
- `exim4` mail packages are broken/unconfigured, which can make `apt install` fail until mail config is fixed

Because of the `exim4` package issue, use already installed PHP/Composer where possible, and install Node manually under `/opt/acf-node`.

## 2. Log In To VPS

```bash
ssh root@145.79.8.231
```

If SSH times out, reboot the VPS from the provider panel first.

## 3. Install Node 22 Without Using Apt

```bash
mkdir -p /opt/acf-node
curl -fL https://nodejs.org/dist/v22.12.0/node-v22.12.0-linux-x64.tar.xz -o /tmp/node-v22.12.0-linux-x64.tar.xz
tar -xJf /tmp/node-v22.12.0-linux-x64.tar.xz -C /opt/acf-node --strip-components=1
export PATH=/opt/acf-node/bin:$PATH
node -v
npm -v
```

Expected Node version: `v22.12.0`.

## 4. Clone The Project

```bash
mkdir -p /var/www
cd /var/www
rm -rf acf
git clone https://github.com/seDiqj/ACF_APR_FINAL.git acf
cd /var/www/acf
```

Expected folders:

```text
aah_apr_back_end-master
aah_apr_front_end-master
excel_package_for_apr_download
```

## 5. Create A Fresh MySQL Database

First try MySQL root socket access:

```bash
php -r 'try {
  $pdo = new PDO("mysql:unix_socket=/run/mysqld/mysqld.sock", "root", "", [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
  $pdo->exec("CREATE DATABASE IF NOT EXISTS ACF_APR_FINAL CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  $pdo->exec("CREATE USER IF NOT EXISTS '\''acf_apr_user'\''@'\''localhost'\'' IDENTIFIED BY '\''ChangeThisStrongPassword123!'\''");
  $pdo->exec("GRANT ALL PRIVILEGES ON ACF_APR_FINAL.* TO '\''acf_apr_user'\''@'\''localhost'\''");
  $pdo->exec("FLUSH PRIVILEGES");
  echo "Database ready\n";
} catch (Throwable $e) {
  echo $e->getMessage()."\n";
  exit(1);
}'
```

If that fails, create the database/user from your hosting panel or MySQL admin console:

- Database: `ACF_APR_FINAL`
- User: `acf_apr_user`
- Password: `ChangeThisStrongPassword123!`

Use a stronger private password in real production.

## 6. Configure Laravel Backend

```bash
cd /var/www/acf/aah_apr_back_end-master

cat > .env <<'EOF'
APP_NAME=ACF
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://145.79.8.231:8000
FRONTEND_URL=http://145.79.8.231:3000

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ACF_APR_FINAL
DB_USERNAME=acf_apr_user
DB_PASSWORD=ChangeThisStrongPassword123!

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null
SANCTUM_STATEFUL_DOMAINS=145.79.8.231:3000,145.79.8.231:8000

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database

# Bootstrap admin password for `php artisan db:seed --force`.
# If not set, a random password is generated and printed during seeding.
SEED_ADMIN_PASSWORD=ChangeThisStrongPassword123!

MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=
REVERB_HOST=145.79.8.231
REVERB_PORT=8080
REVERB_SCHEME=http
REVERB_ALLOWED_ORIGINS="${FRONTEND_URL}"

VITE_APP_NAME="${APP_NAME}"
EOF
```

Install dependencies and initialize Laravel:

```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link || true
php artisan optimize:clear
php artisan config:cache
chmod -R ug+rw storage bootstrap/cache
```

## 7. Configure Next.js Frontend

```bash
cd /var/www/acf/aah_apr_front_end-master

cat > .env.local <<'EOF'
NEXT_PUBLIC_API_BASE_URL=http://145.79.8.231:8000/api
NEXT_PUBLIC_EXCEL_API_BASE_URL=http://145.79.8.231:5000
NEXT_PUBLIC_REVERB_APP_KEY=
NEXT_PUBLIC_REVERB_HOST=145.79.8.231
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
EOF

export PATH=/opt/acf-node/bin:$PATH
npm install
npm run build
```

## 8. Configure APR Excel Service

```bash
cd /var/www/acf/excel_package_for_apr_download
python3 -m py_compile server.py
python3 -c "import openpyxl; print(openpyxl.__version__)"
```

If `openpyxl` is missing and `apt` is working:

```bash
apt-get update
apt-get install -y python3-openpyxl
```

If `apt` is blocked by the existing `exim4` issue, fix the mail package first from your hosting panel/console or install `openpyxl` in a Python virtual environment.

## 9. Create Systemd Services

Backend service:

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
User=root

[Install]
WantedBy=multi-user.target
EOF
```

Excel service:

```bash
cat > /etc/systemd/system/acf-excel.service <<'EOF'
[Unit]
Description=ACF APR Excel Download Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/acf/excel_package_for_apr_download
ExecStart=/usr/bin/python3 server.py
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
EOF
```

Frontend service:

```bash
cat > /etc/systemd/system/acf-frontend.service <<'EOF'
[Unit]
Description=ACF Next Frontend
After=network.target acf-backend.service

[Service]
Type=simple
WorkingDirectory=/var/www/acf/aah_apr_front_end-master
Environment=PATH=/opt/acf-node/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=/opt/acf-node/bin/npm run start -- --hostname 0.0.0.0 --port 3000
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
EOF
```

Queue worker service (REQUIRED - the backend dispatches APR generation, session, and training jobs to a database queue. Without this worker, APRs are never calculated and beneficiaries never appear in the APR):

```bash
cat > /etc/systemd/system/acf-queue.service <<'EOF'
[Unit]
Description=ACF Laravel Queue Worker
After=network.target mysql.service acf-backend.service

[Service]
Type=simple
WorkingDirectory=/var/www/acf/aah_apr_back_end-master
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --max-time=3600
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
EOF
```

Start services:

```bash
systemctl daemon-reload
systemctl enable --now acf-backend
systemctl enable --now acf-excel
systemctl enable --now acf-frontend
systemctl enable --now acf-queue
systemctl status acf-backend --no-pager
systemctl status acf-excel --no-pager
systemctl status acf-frontend --no-pager
systemctl status acf-queue --no-pager
```

## 10. Open Firewall Ports

If UFW is active:

```bash
ufw allow 3000/tcp
ufw allow 5000/tcp
ufw allow 8000/tcp
ufw status
```

Also allow TCP `3000`, `5000`, and `8000` in the VPS provider firewall panel if it has one.

## 11. Verify

```bash
curl -I http://145.79.8.231:8000
curl http://145.79.8.231:5000/health
curl -I http://145.79.8.231:3000/login
journalctl -u acf-backend -n 100 --no-pager
journalctl -u acf-excel -n 100 --no-pager
journalctl -u acf-frontend -n 100 --no-pager
```

Open:

```text
http://145.79.8.231:3000
```

## 12. Troubleshooting

Backend logs:

```bash
journalctl -u acf-backend -f
tail -f /var/www/acf/aah_apr_back_end-master/storage/logs/laravel.log
```

Frontend logs:

```bash
journalctl -u acf-frontend -f
```

Excel service logs:

```bash
journalctl -u acf-excel -f
```

Check ports:

```bash
ss -ltnp | grep -E ':3000|:5000|:8000'
```

If the frontend cannot call the API, check:

- `NEXT_PUBLIC_API_BASE_URL` in frontend `.env.local`
- `NEXT_PUBLIC_EXCEL_API_BASE_URL` in frontend `.env.local`
- `FRONTEND_URL` in backend `.env`
- backend CORS cache: run `php artisan optimize:clear && php artisan config:cache`

## 13. Later Domain Setup

When you get a domain, point DNS to `145.79.8.231`, then proxy:

- `/` to `127.0.0.1:3000`
- `/api` to `127.0.0.1:8000/api`
- `/excel` or `/generate-excel` to `127.0.0.1:5000`

Then update:

- Laravel `APP_URL`
- Laravel `FRONTEND_URL`
- Laravel `SANCTUM_STATEFUL_DOMAINS`
- Frontend `NEXT_PUBLIC_API_BASE_URL`
- Frontend `NEXT_PUBLIC_EXCEL_API_BASE_URL`

Finally install SSL with Certbot.
