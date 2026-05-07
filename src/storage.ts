import type { Todo } from "./types";

const STORAGE_KEY = "todo-list-react.tasks.v1";

const isTodo = (value: unknown): value is Todo => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Todo>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.completed === "boolean" &&
    (candidate.priority === "low" ||
      candidate.priority === "medium" ||
      candidate.priority === "high") &&
    typeof candidate.dueDate === "string" &&
    typeof candidate.createdAt === "string"
  );
};

export const loadTodos = (): Todo[] => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isTodo) : [];
  } catch {
    return [];
  }
};

export const saveTodos = (todos: Todo[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Storage can fail in private mode or restricted browser environments.
  }
};
