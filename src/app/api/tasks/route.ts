import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { withTenant } from "@/server/tenant";
import { CreateTaskRequest } from "@/lib/zod-schemas";

export const GET = withTenant(null, async (ctx, req: Request) => {
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";
  const status = url.searchParams.get("status");

  const tasks = await prisma.task.findMany({
    where: {
      brandId: ctx.brandId,
      ...(mine ? { assigneeId: ctx.userId } : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: {
      assignee: { select: { id: true, name: true } },
      relatedContent: { select: { id: true, title: true, type: true } },
      relatedLead: { select: { id: true, firstName: true, lastName: true } },
      relatedCampaign: { select: { id: true, name: true } },
    },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    take: 300,
  });
  return NextResponse.json({ tasks });
});

export const POST = withTenant(null, async (ctx, req: Request) => {
  const body = await req.json();
  const parsed = CreateTaskRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation", message: parsed.error.message } }, { status: 400 });
  }
  const t = await prisma.task.create({
    data: {
      brandId: ctx.brandId,
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      assigneeId: parsed.data.assigneeId ?? ctx.userId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      priority: parsed.data.priority,
      relatedContentId: parsed.data.relatedContentId,
      relatedLeadId: parsed.data.relatedLeadId,
      relatedCampaignId: parsed.data.relatedCampaignId,
    },
  });
  return NextResponse.json({ task: t }, { status: 201 });
});
