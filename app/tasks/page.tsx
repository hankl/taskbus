import Link from "next/link";

import { listTasks } from "@/lib/task-service";
import { listTasksSchema } from "@/lib/task-schema";

type TaskRow = {
  id: number;
  name: string;
  creator: string;
  executor: string;
  fileUrl: string;
  status: "pending" | "running" | "done";
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
};

function formatTime(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function statusClass(status: string) {
  return `badge ${status}`;
}

export default async function TasksPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;
  const parsed = listTasksSchema.parse({
    executor: typeof rawSearchParams.executor === "string" ? rawSearchParams.executor : undefined,
    creator: typeof rawSearchParams.creator === "string" ? rawSearchParams.creator : undefined,
    status: typeof rawSearchParams.status === "string" ? rawSearchParams.status : undefined,
    page: typeof rawSearchParams.page === "string" ? rawSearchParams.page : undefined,
    pageSize: typeof rawSearchParams.pageSize === "string" ? rawSearchParams.pageSize : undefined
  });

  const result = await listTasks(parsed);

  return (
    <main className="shell">
      <section className="hero">
        <h1>TaskBus</h1>
        <p>面向 AI agent 协作的最小任务总线。任务内容通过 `fileUrl` 引用外部文件，页面只负责观察任务的创建、领取和完成状态。</p>
      </section>

      <form className="panel toolbar" method="get">
        <div className="field">
          <label htmlFor="executor">Executor</label>
          <input id="executor" name="executor" defaultValue={parsed.executor ?? ""} placeholder="agent-b" />
        </div>
        <div className="field">
          <label htmlFor="creator">Creator</label>
          <input id="creator" name="creator" defaultValue={parsed.creator ?? ""} placeholder="agent-a" />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={parsed.status ?? ""}>
            <option value="">all</option>
            <option value="pending">pending</option>
            <option value="running">running</option>
            <option value="done">done</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="pageSize">Page Size</label>
          <select id="pageSize" name="pageSize" defaultValue={String(parsed.pageSize)}>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="actions">
          <button className="button" type="submit">
            筛选
          </button>
        </div>
      </form>

      <section className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Creator</th>
              <th>Executor</th>
              <th>File URL</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Started</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((task: TaskRow) => (
              <tr key={task.id}>
                <td>
                  <Link href={`/tasks/${task.id}`}>{task.id}</Link>
                </td>
                <td>{task.name}</td>
                <td>{task.creator}</td>
                <td>{task.executor}</td>
                <td>{task.fileUrl}</td>
                <td>
                  <span className={statusClass(task.status)}>{task.status}</span>
                </td>
                <td>{formatTime(task.createdAt)}</td>
                <td>{formatTime(task.updatedAt)}</td>
                <td>{formatTime(task.startedAt)}</td>
                <td>{formatTime(task.completedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.items.length === 0 ? <div className="empty">当前没有符合条件的任务。</div> : null}
      </section>

      <p className="meta">
        Total {result.total} tasks, page {result.page}, page size {result.pageSize}
      </p>
    </main>
  );
}
