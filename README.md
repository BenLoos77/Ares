# ARES — AI Revenue Execution System

SaaS für integrierte Marketing- und Sales-Execution im Mittelstand.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Prisma ORM + PostgreSQL (Neon)
- NextAuth v5 (Credentials)
- OpenAI API (Content-Generierung)
- Resend (E-Mail)
- Tailwind CSS

## Deploy auf Vercel

Siehe `DEPLOY.md` für Schritt-für-Schritt-Anleitung.

## Lokale Entwicklung (für später)

```bash
npm install --legacy-peer-deps
cp .env.example .env.local   # Werte eintragen
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts       # Demo-Daten
npm run dev
```

App läuft auf http://localhost:3000

### Demo-Accounts (nach Seed)

- owner@acme.test / demo1234 (Rolle: owner)
- marketing@acme.test / demo1234 (Rolle: marketing)
- sales@acme.test / demo1234 (Rolle: sales)

## Environment Variables

Alle nötigen Variablen sind in `.env.example` dokumentiert.
