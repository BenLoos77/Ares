import { notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { ContentEditorClient } from "@/components/content/ContentEditorClient";

export const dynamic = "force-dynamic";

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session!.user.organizationId },
    select: { id: true },
  });
  if (!brand) return notFound();

  const content = await prisma.content.findFirst({
    where: { id: params.id, brandId: brand.id },
    include: {
      persona: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
      reviewer: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true } },
      versions: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
  if (!content) return notFound();

  const users = await prisma.user.findMany({
    where: { organizationId: session!.user.organizationId, role: { in: ["owner", "admin", "marketing"] } },
    select: { id: true, name: true, role: true },
  });

  return (
    <ContentEditorClient
      content={JSON.parse(JSON.stringify(content))}
      users={users}
      currentUserId={session!.user.id}
    />
  );
}
