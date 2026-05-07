import React, { useState, useEffect, FormEvent, useRef } from "react";
import "./App.css";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { loadTodos, saveTodos } from "./storage";
import type { Todo, Priority, Filter } from "./types";

const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
};

const getPriorityLabel = (priority: Priority): string => {
  switch (priority) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "";
  }
};

const TodoItem: React.FC<{
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ todo, onToggle, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(todo.id), 300);
  };

  return (
    <div
      className={`todo-item ${todo.completed ? "completed" : ""} ${
        isDeleting ? "deleting" : ""
      }`}
    >
      <div className="todo-checkbox" onClick={() => onToggle(todo.id)}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="check-icon"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="todo-content">
        <span className="todo-text">{todo.text}</span>

        <div className="todo-meta">
          {todo.priority && (
            <span
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(todo.priority) }}
            >
              {getPriorityLabel(todo.priority)}
            </span>
          )}
          {todo.dueDate && (
            <span className="due-date">
              {new Date(todo.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      <button className="delete-btn" onClick={handleDelete}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
        </svg>
      </button>
    </div>
  );
};

const AddTodoForm: React.FC<{ onAdd: (text: string, priority?: Priority, dueDate?: string) => void }> = ({
  onAdd,
}) => {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [dueDate, setDueDate] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), priority, dueDate || undefined);
    setText("");
    setPriority(undefined);
    setDueDate("");
    setIsExpanded(false);
    inputRef.current?.focus();
  };

  return (
    <form className="add-todo-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new task..."
        className="todo-input"
      />

      <div className={`form-options ${isExpanded ? "expanded" : ""}`}>
        <select
          value={priority || ""}
          onChange={(e) =>
            setPriority(
              e.target.value ? (e.target.value as Priority) : undefined
            )
          }
          className="priority-select"
        >
          <option value="">Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="date-input"
        />

        <button
          type="submit"
          className="add-btn"
          disabled={!text.trim()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className="expand-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </form>
  );
};

const FilterBar: React.FC<{
  currentFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  counts: { all: number; active: number; completed: number };
}> = ({ currentFilter, onFilterChange, counts }) => {
  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="filter-bar">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`filter-btn ${currentFilter === filter.value ? "active" : ""}`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
          <span className="filter-count">({counts[filter.value]})</span>
        </button>
      ))}
    </div>
  );
};

const EmptyState: React.FC<{ filter: Filter }> = ({ filter }) => {
  const messages: Record<Filter, string> = {
    all: "No tasks yet. Add one above!",
    active: "All tasks completed! 🎉",
    completed: "No completed tasks yet.",
  };

  return (
    <div className="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p>{messages[filter]}</p>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const loaded = loadTodos();
    setTodos(loaded);
  }, []);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = (text: string, priority?: Priority, dueDate?: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Tasks</h1>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <AddTodoForm onAdd={addTodo} />

          {todos.length > 0 && (
            <FilterBar
              currentFilter={filter}
              onFilterChange={setFilter}
              counts={counts}
            />
          )}

          <div className="todo-list">
            {filteredTodos.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              ))
            )}
          </div>

          {todos.length > 0 && (
            <div className="stats-bar">
              <span>{counts.completed} of {counts.all} tasks completed</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${counts.all > 0 ? (counts.completed / counts.all) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
