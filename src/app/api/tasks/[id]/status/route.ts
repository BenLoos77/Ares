import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { withTenant } from "@/server/tenant";

const Body = z.object({ status: z.enum(["todo", "in_progress", "blocked", "done"]) });

export const PATCH = withTenant(null, async (ctx, req: Request, props: { params: Promise<{ id: string }> }) => {
    const { id } = await props.params;
  const body = await req.json();
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: "validation", message: parsed.error.message } }, { status: 400 });

  const existing = await prisma.task.findFirst({ where: { id: id, brandId: ctx.brandId } });
  if (!existing) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });

  const updated = await prisma.task.update({
    where: { id: id },
    data: {
      status: parsed.data.status,
      completedAt: parsed.data.status === "done" ? new Date() : null,
    },
  });
  return NextResponse.json({ task: updated });
});
