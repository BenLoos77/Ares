"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/FormFields";
import { Sparkles, Check } from "lucide-react";

interface Persona {
  id: string;
  name: string;
}
interface Draft {
  raw: any;
  title: string;
  doc: any;
  plain: string;
}

export default function ContentNewPage() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultType = params.get("type") || "blog";

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [type, setType] = useState(defaultType);
  const [personaId, setPersonaId] = useState("");
  const [topic, setTopic] = useState("");
  const [keyMessage, setKeyMessage] = useState("");
  const [cta, setCta] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [promptPayload, setPromptPayload] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/brand");
      const j = await res.json();
      const ps: Persona[] = j.brand?.personas || [];
      setPersonas(ps);
      if (ps.length > 0) setPersonaId(ps[0].id);
    })();
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    setDrafts(null);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          personaId,
          briefing: { topic, keyMessage, cta: cta || undefined },
          variants: 2,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error?.message || "Generierung fehlgeschlagen");
      }
      const j = await res.json();
      setDrafts(j.drafts);
      setPromptPayload(j.promptPayload);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function useDraft(idx: number) {
    if (!drafts) return;
    const d = drafts[idx];
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: d.title,
          bodyRichText: d.doc,
          bodyPlain: d.plain,
          meta: d.raw,
          personaId,
          channel: type,
          promptPayload,
          aiGenerated: true,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.message || "Speichern fehlgeschlagen");
      router.push(`/app/content/${j.content.id}`);
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Neuen Content erstellen</h1>

      <Card>
        <CardHeader>
          <CardTitle>Briefing</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Typ</Label>
              <Select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="blog">Blog-Artikel</option>
                <option value="landing">Landingpage</option>
                <option value="linkedin_post">LinkedIn-Post</option>
                <option value="sales_email">Sales-E-Mail</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="persona">Persona</Label>
              <Select id="persona" value={personaId} onChange={(e) => setPersonaId(e.target.value)}>
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="topic">Thema</Label>
            <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="z. B. Wie Mittelständler KI im Marketing einsetzen" />
          </div>
          <div>
            <Label htmlFor="keyMessage">Kernbotschaft</Label>
            <Textarea id="keyMessage" rows={2} value={keyMessage} onChange={(e) => setKeyMessage(e.target.value)} placeholder="Der Punkt, der auf jeden Fall rüberkommen muss" />
          </div>
          <div>
            <Label htmlFor="cta">Call-to-Action (optional)</Label>
            <Input id="cta" value={cta} onChange={(e) => setCta(e.target.value)} placeholder="z. B. Demo buchen" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="pt-2">
            <Button
              onClick={generate}
              loading={loading}
              disabled={!topic || !keyMessage || !personaId}
            >
              <Sparkles className="h-4 w-4" />
              Zwei Varianten generieren
            </Button>
          </div>
        </CardBody>
      </Card>

      {drafts && (
        <div className="grid md:grid-cols-2 gap-4">
          {drafts.map((d, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>Variante {String.fromCharCode(65 + i)}</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="font-semibold text-gray-900 mb-2">{d.title}</div>
                <div className="text-sm text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap border border-gray-100 rounded-md p-3 bg-gray-50">
                  {d.plain.slice(0, 1200)}
                  {d.plain.length > 1200 && "…"}
                </div>
                <div className="mt-4">
                  <Button onClick={() => useDraft(i)} loading={saving}>
                    <Check className="h-4 w-4" /> Diese verwenden
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
