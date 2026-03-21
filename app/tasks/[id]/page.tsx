import Link from "next/link";
import { notFound } from "next/navigation";

import { getTaskById } from "@/lib/task-service";

function formatTime(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const task = await getTaskById(numericId);

  if (!task) {
    notFound();
  }

  return (
    <main className="shell">
      <section className="hero">
        <h1>Task #{task.id}</h1>
        <p>
          <Link href="/tasks">返回任务列表</Link>
        </p>
      </section>

      <section className="panel detail">
        <div className="detail-grid">
          <div className="detail-card">
            <h3>Name</h3>
            <p>{task.name}</p>
          </div>
          <div className="detail-card">
            <h3>Status</h3>
            <p>{task.status}</p>
          </div>
          <div className="detail-card">
            <h3>Creator</h3>
            <p>{task.creator}</p>
          </div>
          <div className="detail-card">
            <h3>Executor</h3>
            <p>{task.executor}</p>
          </div>
          <div className="detail-card">
            <h3>File ID</h3>
            <p>{task.fileId}</p>
          </div>
          <div className="detail-card">
            <h3>Created</h3>
            <p>{formatTime(task.createdAt)}</p>
          </div>
          <div className="detail-card">
            <h3>Updated</h3>
            <p>{formatTime(task.updatedAt)}</p>
          </div>
          <div className="detail-card">
            <h3>Started</h3>
            <p>{formatTime(task.startedAt)}</p>
          </div>
          <div className="detail-card">
            <h3>Completed</h3>
            <p>{formatTime(task.completedAt)}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

