import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { KanbanBoardClient } from "@/components/execution/KanbanBoardClient";

export const dynamic = "force-dynamic";

export default async function ExecutionPage() {
  const session = await auth();
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session!.user.organizationId },
    select: { id: true },
  });

  const tasks = await prisma.task.findMany({
    where: { brandId: brand!.id, status: { not: "done" } },
    include: {
      assignee: { select: { id: true, name: true } },
      relatedContent: { select: { id: true, title: true } },
      relatedLead: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Execution Board</h1>
          <p className="text-sm text-gray-500 mt-1">{tasks.length} offene Aufgaben</p>
        </div>
      </div>
      <KanbanBoardClient initialTasks={JSON.parse(JSON.stringify(tasks))} />
    </div>
  );
}
