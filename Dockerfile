# Image tunggal (bukan multi-stage) — proyek ini kecil/lokal, jadi diprioritaskan
# kesederhanaan & keandalan build (khususnya untuk native binary Prisma) di atas ukuran image.
FROM node:20-slim

WORKDIR /app

# Prisma query engine butuh OpenSSL — node:20-slim (Debian) tidak menyertakannya secara default.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies dulu (cache layer terpisah dari source code)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source, lalu generate Prisma Client & build Next.js.
# `prisma generate` dijalankan di sini (di dalam container Linux) supaya native query
# engine yang dihasilkan cocok dengan OS container — jangan pakai hasil generate dari host.
# DATABASE_URL di sini cuma untuk memenuhi validasi prisma.config.ts saat build —
# nilai sebenarnya di-set lewat docker-compose environment saat container jalan.
COPY . .
ENV DATABASE_URL="file:/app/data/dev.db"
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
