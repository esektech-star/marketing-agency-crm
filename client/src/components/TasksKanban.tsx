import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Trash2, Pencil, AlertTriangle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate: Date | string;
  assignedTo?: any;
  relatedClient?: number | null;
  attachments?: any;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

interface TasksKanbanProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string | number) => Promise<void> | void;
  teamMembers: any[];
  clients: any[];
  isLoading?: boolean;
}

const STATUS_COLUMNS = [
  { key: "pending", label: "To Do", color: "bg-blue-50 border-blue-200" },
  { key: "in_progress", label: "In Progress", color: "bg-yellow-50 border-yellow-200" },
  { key: "completed", label: "Done", color: "bg-green-50 border-green-200" },
  { key: "cancelled", label: "Cancelled", color: "bg-gray-50 border-gray-200" },
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const getDueState = (dueDate: any): "overdue" | "soon" | "normal" => {
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  const diffMin = (due - now) / 60000;
  if (diffMin < 0) return "overdue";
  if (diffMin <= 30) return "soon";
  return "normal";
};

const formatDate = (date: any) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  teamMembers,
  t,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string | number) => void;
  teamMembers: any[];
  t: any;
}) => {
  const dueState = getDueState(task.dueDate);
  const assignedNames = task.assignedTo
    ?.map((id: any) => teamMembers.find((m) => m.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      draggable
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm line-clamp-2 flex-1">{task.title}</h4>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onEdit(task)}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2 mb-2">
        <Badge
          variant="outline"
          className={`text-xs ${PRIORITY_COLORS[task.priority]}`}
        >
          {task.priority}
        </Badge>
        {dueState === "overdue" && (
          <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            <AlertTriangle className="w-3 h-3" />
            {t("tasks.overdue", "Overdue")}
          </div>
        )}
        {dueState === "soon" && (
          <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            {t("tasks.dueSoon", "Due soon")}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(task.dueDate)}</span>
        {assignedNames && (
          <span className="truncate max-w-[100px]" title={assignedNames}>
            {assignedNames}
          </span>
        )}
      </div>
    </div>
  );
};

export default function TasksKanban({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  teamMembers,
  clients,
  isLoading,
}: TasksKanbanProps) {
  const { t } = useTranslation();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask) {
      onStatusChange(draggedTask.id, status as string);
      setDraggedTask(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATUS_COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.key);
        return (
          <div
            key={column.key}
            className={`border-2 rounded-lg p-4 min-h-[500px] ${column.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{column.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {columnTasks.length} {t("tasks.tasks", "tasks")}
                </p>
              </div>

            </div>

            <div className="space-y-3">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t("tasks.noTasks", "No tasks")}
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={() => setDraggedTask(null)}
                  >
                    <TaskCard
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      teamMembers={teamMembers}
                      t={t}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
