#!/bin/sh
set -e

echo "Menjalankan migrasi database..."
npx prisma migrate deploy

echo "Mengisi konfigurasi pricing default (idempotent)..."
npx tsx prisma/seed.ts

exec "$@"
