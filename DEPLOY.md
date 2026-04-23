# ARES Deploy-Anleitung

Schritt-für-Schritt für den ersten Live-Deploy auf Vercel.

Voraussetzungen (hast du schon):
- GitHub-Account
- Vercel-Account
- Neon-Projekt mit Connection String
- OpenAI API-Key
- Resend API-Key

## Schritt 1: Code auf GitHub hochladen

1. Auf [github.com](https://github.com) einloggen
2. Oben rechts auf `+` → `New repository`
3. Einstellungen:
   - Repository name: `ares`
   - Description: `ARES Execution System`
   - Visibility: **Private** (niemals public!)
   - "Add a README file" **deaktivieren**
   - "Add .gitignore" auf **None**
4. `Create repository`

Auf der nächsten Seite siehst du zwei Boxen mit Code-Anweisungen. **Ignorieren!**

Stattdessen den Link `uploading an existing file` klicken (im ersten Satz "…or create a new repository on the command line" unten).

Oder direkt diese URL nutzen:
`https://github.com/DEIN-USERNAME/ares/upload/main`

5. Den **entpackten Ordner-Inhalt** (nicht den Ordner selbst!) in das Drop-Feld ziehen:
   - Öffne im Finder den Ordner `ares-v2`
   - Wähle mit Cmd+A ALLE Dateien und Ordner darin aus
   - Ziehe die Auswahl in das Browser-Fenster
6. Unten "Commit message": `Initial commit`
7. `Commit changes` drücken

Upload dauert 1–2 Minuten.

## Schritt 2: NEXTAUTH_SECRET generieren

Du brauchst einen zufälligen geheimen String für die Login-Verschlüsselung.

Einfachster Weg: Gehe auf [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) und kopiere den angezeigten String in deine "ARES Secrets"-Notiz unter `NEXTAUTH_SECRET`.

## Schritt 3: DIRECT_URL ermitteln

Neon liefert zwei Varianten deines Connection Strings:

- **Pooled** (mit `-pooler` im Hostnamen): für `DATABASE_URL`
- **Direct** (ohne `-pooler`): für `DIRECT_URL`

So findest du beide:
1. In Neon: Dashboard → dein `ares`-Projekt
2. Unter "Connection Details" siehst du einen Dropdown "Connection pooling"
3. Zuerst **"Pooled connection"** auswählen, String kopieren → `DATABASE_URL`
4. Dann auf **"Direct connection"** umstellen, String kopieren → `DIRECT_URL`

Beide Werte in der Notiz speichern.

## Schritt 4: Projekt in Vercel importieren

1. Auf [vercel.com](https://vercel.com/dashboard) einloggen
2. `Add New` → `Project`
3. "Import Git Repository" — dein GitHub-Repo `ares` sollte auftauchen
4. Neben `ares` auf `Import` klicken
5. Auf dem Konfigurations-Screen:
   - Project Name: `ares` (oder freilassen)
   - Framework Preset: sollte automatisch "Next.js" erkennen
   - Root Directory: `./` (Standard)
   - **Noch nicht deployen!** Erst Env-Variablen eintragen.

## Schritt 5: Environment Variables eintragen

Auf dem Import-Screen den Abschnitt "Environment Variables" aufklappen.

Jede Variable mit Name und Wert eintragen. Alle aus deiner "ARES Secrets"-Notiz:

| Name | Wert |
|---|---|
| `DATABASE_URL` | Neon Pooled Connection String |
| `DIRECT_URL` | Neon Direct Connection String |
| `NEXTAUTH_SECRET` | Zufälliger 32-Zeichen-String |
| `NEXTAUTH_URL` | `https://ares.vercel.app` (oder deine spätere URL — kannst später anpassen) |
| `OPENAI_API_KEY` | Dein `sk-proj-...`-Key |
| `RESEND_API_KEY` | Dein `re_...`-Key |
| `RESEND_FROM` | `ARES <onboarding@resend.dev>` |

Optional (nur falls du auch Anthropic-Keys hast):
| `ANTHROPIC_API_KEY` | leer lassen oder Key eintragen |

## Schritt 6: Deploy starten

Unten auf `Deploy` drücken.

Build dauert 2–5 Minuten. Status-Anzeige im Browser.

**Wenn alles grün:** Vercel zeigt dir die Live-URL (z. B. `https://ares-xyz123.vercel.app`).

**Wenn rote Fehler:** Siehe "Troubleshooting" unten.

## Schritt 7: NEXTAUTH_URL korrigieren

Nach dem ersten Deploy kennst du die echte URL. Die musst du jetzt in die Env-Variablen eintragen:

1. Vercel → dein Projekt → `Settings` → `Environment Variables`
2. `NEXTAUTH_URL` suchen → `Edit`
3. Wert ersetzen mit der echten URL (z. B. `https://ares-xyz123.vercel.app`) — ohne Trailing-Slash
4. Speichern
5. Oben → `Deployments` → den letzten Deploy → `...` → `Redeploy`

## Schritt 8: Erste Nutzer anlegen

Nach dem Deploy ist die Datenbank leer. Deine erste Aufgabe: einen Owner-Account registrieren.

1. `https://DEINE-VERCEL-URL/register` öffnen
2. Formular ausfüllen: Firma, Name, E-Mail, Passwort
3. Du landest im Onboarding
4. Brand-DNA, Personas, Ziele eintragen
5. Fertig — du bist drin

## Troubleshooting

### Build-Fehler in Vercel: "Type error"
Meistens TypeScript-Strictness. In seltenen Fällen brauchen wir `next.config.mjs` mit `typescript: { ignoreBuildErrors: true }`. **Nicht standardmäßig machen**, weil echte Fehler verdeckt werden.

### Build-Fehler: "Prisma Client not generated"
`npm run vercel-build` sollte das automatisch lösen. Prüfen: `package.json` → `scripts` → `vercel-build` vorhanden und korrekt.

### Runtime-Fehler: "Can't reach database"
- `DATABASE_URL` falsch gesetzt oder Passwort falsch
- In Neon prüfen: Is das Projekt aktiv? (Free Tier schläft nach Inaktivität ein, wacht automatisch wieder auf)

### Runtime-Fehler: "NEXTAUTH_URL missing"
Nach dem ersten Deploy den URL-Fix aus Schritt 7 durchführen.

### Login geht nicht
- `NEXTAUTH_SECRET` muss gesetzt sein
- `NEXTAUTH_URL` muss exakt der Vercel-URL entsprechen (kein Tipp-Fehler)
- Cookies im Browser löschen und neu versuchen

## Kosten im Blick behalten

- **Vercel Hobby**: 0 €, reicht für 10–20 interne Nutzer
- **Neon Free**: 0 €, reicht für ~500 MB Daten
- **OpenAI**: pro Content-Generierung ~0,01–0,05 €
- **Resend Free**: 3.000 Mails/Monat kostenlos

**Wichtig**: OpenAI-Budget-Limit auf 20 €/Monat gesetzt lassen, bis ihr wisst, wie viel ihr nutzt.
