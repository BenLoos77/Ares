import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const org = await prisma.organization.create({
    data: {
      name: "ACME Mittelstand GmbH",
      plan: "pro",
      users: {
        create: [
          {
            email: "owner@acme.test",
            name: "Sarah Owner",
            passwordHash,
            role: "owner",
          },
          {
            email: "marketing@acme.test",
            name: "Max Marketing",
            passwordHash,
            role: "marketing",
          },
          {
            email: "sales@acme.test",
            name: "Lena Sales",
            passwordHash,
            role: "sales",
          },
        ],
      },
    },
    include: { users: true },
  });

  const owner = org.users.find((u) => u.role === "owner")!;

  const brand = await prisma.brand.create({
    data: {
      organizationId: org.id,
      name: "ACME",
      vision: "Mittelständler führen ihre Marketing- und Sales-Ops mit der Ruhe eines Konzerns.",
      mission: "Wir geben Teams das System, das Strategie in Umsatz übersetzt.",
      values: ["Umsetzung", "Transparenz", "Augenhöhe"],
      positioning:
        "ARES ist das Execution-System, das Marketing und Sales im Mittelstand aus Strategie zu messbaren Maßnahmen verbindet.",
      usp: [
        "Strategie → Content → Aufgaben → Umsatz auf einer Plattform",
        "AI-Empfehlungen, die zur konkreten Aktion führen",
        "Marketing-Sales-Feedback-Loop in Echtzeit",
      ],
      toneFormality: 3,
      toneOpinion: 4,
      keyMessages: [
        "Von der Idee zur veröffentlichten Maßnahme in < 1 Tag",
        "Jeder Lead kennt seinen Content-Ursprung",
        "Der AI Copilot arbeitet mit, er reportet nicht nur",
      ],
      noGos: ["leere Floskeln", "Buzzwords ohne Substanz", "generische Stock-Phrasen"],
      personas: {
        create: [
          {
            name: "Mittelstand-Marketingleiter",
            roleTitle: "Head of Marketing",
            industry: "B2B Services",
            painPoints: [
              "Zu viele Ideen, zu wenig Umsetzung",
              "Content-Chaos über mehrere Kanäle",
              "Unklar welcher Content Leads bringt",
            ],
            buyingMotives: ["Zeit sparen", "Team entlasten", "Messbarkeit"],
            objections: ["Noch ein Tool?", "Werden wir das wirklich nutzen?"],
            isDecisionMaker: true,
          },
          {
            name: "Mittelstand-Vertriebsleiter",
            roleTitle: "Head of Sales",
            industry: "B2B Services",
            painPoints: [
              "Leads fallen durch die Ritzen",
              "Marketing-Content hilft im Verkaufsgespräch kaum",
              "Follow-ups werden vergessen",
            ],
            buyingMotives: ["Mehr Abschlüsse", "Bessere Lead-Qualität"],
            objections: ["CRM-Integration?"],
            isDecisionMaker: true,
          },
        ],
      },
      competitors: {
        create: [
          {
            name: "HubSpot",
            positioning: "All-in-One, für große Marketing-Abteilungen",
            ourDifferentiation: "ARES ist schlanker, Execution-fokussiert, deutschsprachig zuerst.",
          },
          {
            name: "Jasper/Copy.ai",
            positioning: "Content-Produktion",
            ourDifferentiation: "ARES generiert Content UND erzeugt die Umsetzungs-Tasks.",
          },
        ],
      },
      goals: {
        create: [
          {
            category: "marketing",
            title: "50 MQL im laufenden Quartal",
            targetValue: 50,
            currentValue: 12,
            unit: "Leads",
            periodStart: new Date(Date.now() - 30 * 24 * 3600 * 1000),
            periodEnd: new Date(Date.now() + 60 * 24 * 3600 * 1000),
          },
          {
            category: "sales",
            title: "250.000 € Pipeline-Wert",
            targetValue: 250000,
            currentValue: 85000,
            unit: "€",
            periodStart: new Date(Date.now() - 30 * 24 * 3600 * 1000),
            periodEnd: new Date(Date.now() + 60 * 24 * 3600 * 1000),
          },
        ],
      },
    },
    include: { personas: true },
  });

  const personaId = brand.personas[0].id;

  // Demo-Lead
  await prisma.lead.create({
    data: {
      brandId: brand.id,
      firstName: "Thomas",
      lastName: "Beispielmann",
      company: "Demo AG",
      email: "thomas@demo.test",
      source: "website_form",
      personaId,
      personaMatchScore: 84,
      stage: "contacted",
      score: 72,
      ownerId: org.users.find((u) => u.role === "sales")!.id,
      lastActivityAt: new Date(Date.now() - 50 * 3600 * 1000), // 50h ago → followup fällig
    },
  });

  // Demo-Recommendations
  await prisma.recommendation.createMany({
    data: [
      {
        brandId: brand.id,
        type: "content_gap",
        title: "Zu wenig LinkedIn-Content geplant",
        reasoning: "In den nächsten 7 Tagen ist nur 1 LinkedIn-Post geplant, Ziel: 3.",
        ctaTarget: "/app/content/new?channel=linkedin_post",
        priorityScore: 80,
      },
      {
        brandId: brand.id,
        type: "hot_lead",
        title: "Hot Lead: Thomas Beispielmann",
        reasoning: "Persona-Match 84, 50h ohne Aktivität. Follow-up empfohlen.",
        ctaTarget: "/app/sales",
        priorityScore: 90,
      },
    ],
  });

  console.log("Seed done. Login:");
  console.log("  owner@acme.test / demo1234");
  console.log("  marketing@acme.test / demo1234");
  console.log("  sales@acme.test / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
