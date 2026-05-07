import React, { useState, useEffect, FormEvent, useRef } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { Todo, Filter, Priority } from "./types";
import { loadTodos, saveTodos } from "./storage";

const useDebounce = (value: string, delay: number): string => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const TodoApp: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    try {
      setIsLoading(true);
      const stored = loadTodos();
      if (stored) {
        setTodos(stored);
      }
    } catch (err) {
      setError("할 일 목록을 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      saveTodos(todos);
    } catch {
      // ignore
    }
  }, [todos]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const addTodo = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newTodo: Todo = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: trimmed,
      completed: false,
      priority: priority || "medium",
      dueDate: dueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setAnimatingIds((prev) => new Set(prev).add(newTodo.id));
    setInputValue("");
    setPriority("");
    setDueDate("");
    setTimeout(() => {
      setAnimatingIds((prev) => {
        const next = new Set(prev);
        next.delete(newTodo.id);
        return next;
      });
    }, 400);
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setAnimatingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setAnimatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  };

  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && editingId) {
      setTodos((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, text: trimmed } : t))
      );
    }
    setEditingId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const filteredTodos = todos
    .filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    })
    .filter((t) => {
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return t.text.toLowerCase().includes(q);
    });

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
    progress: todos.length > 0 ? (todos.filter((t) => t.completed).length / todos.length) * 100 : 0,
  };

  const isOverdue = (dueDateStr?: string): boolean => {
    if (!dueDateStr) return false;
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getPriorityColor = (p?: Priority): string => {
    switch (p) {
      case "high": return theme === "dark" ? "#f87171" : "#ef4444";
      case "medium": return theme === "dark" ? "#fbbf24" : "#f59e0b";
      case "low": return theme === "dark" ? "#34d399" : "#10b981";
      default: return theme === "dark" ? "#777" : "#999";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
    if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const priorityOptions: { value: Priority | ""; label: string }[] = [
    { value: "", label: "우선순위" },
    { value: "high", label: "높음" },
    { value: "medium", label: "중간" },
    { value: "low", label: "낮음" },
  ];

  return (
    <div className="app-container" onKeyDown={handleKeyDown}>
      <header className="app-header">
        <div>
          <h1 className="app-title">Tasks</h1>
          {stats.total > 0 && (
            <div className="stats-bar">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
              <span className="stats-text">
                {stats.completed}/{stats.total} 완료 ({Math.round(stats.progress)}%)
              </span>
            </div>
          )}
        </div>
        <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="테마 전환">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      <form className="input-form" onSubmit={addTodo}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="새 할 일 추가..."
          className="main-input"
        />
        <div className="input-options">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | "")}
            className="option-select"
            aria-label="우선순위"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="option-select date-input"
            aria-label="마감일"
          />
          <button type="submit" className="add-btn" disabled={!inputValue.trim()}>
            추가
          </button>
        </div>
      </form>

      <div className="search-filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..."
            className="search-input"
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
        <div className="filter-tabs">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "전체" : f === "active" ? "진행중" : "완료"}
              {f === "all" && ` (${stats.total})`}
              {f === "active" && ` (${stats.active})`}
              {f === "completed" && ` (${stats.completed})`}
            </button>
          ))}
        </div>
      </div>

      <main className="todo-list-container">
        {isLoading ? (
          <div className="loading-state">로딩 중...</div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">{search ? "🔍" : filter === "completed" ? "🎉" : "📝"}</span>
            <p className="empty-text">
              {search
                ? `"${debouncedSearch}" 검색 결과 없음`
                : filter === "completed"
                ? "완료된 할 일이 없습니다"
                : "할 일이 없습니다"}
            </p>
            {!search && filter !== "completed" && (
              <p className="empty-hint">위 입력창에 할 일을 추가해보세요</p>
            )}
          </div>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? "completed" : ""} ${
                  animatingIds.has(todo.id) ? "animating" : ""
                }`}
              >
                <div className="todo-checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="todo-checkbox"
                  />
                </div>

                {editingId === todo.id ? (
                  <div className="edit-mode">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="edit-input"
                    />
                  </div>
                ) : (
                  <div className="todo-content" onDoubleClick={() => startEdit(todo)}>
                    <span className={`todo-text ${todo.completed ? "completed" : ""}`}>
                      {todo.text}
                    </span>
                    <div className="todo-meta">
                      {todo.priority && (
                        <span
                          className="priority-chip"
                          style={{ backgroundColor: getPriorityColor(todo.priority) }}
                        >
                          {todo.priority === "high" ? "높음" : todo.priority === "medium" ? "중간" : "낮음"}
                        </span>
                      )}
                      {todo.dueDate && (
                        <span className={`due-date ${isOverdue(todo.dueDate) && !todo.completed ? "overdue" : ""}`}>
                          {formatDate(todo.dueDate)}
                          {isOverdue(todo.dueDate) && !todo.completed && " ⚠️"}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {editingId !== todo.id && (
                  <div className="todo-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => startEdit(todo)}
                      title="편집"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => deleteTodo(todo.id)}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {stats.completed > 0 && (
        <div className="bulk-actions">
          <button className="bulk-btn" onClick={clearCompleted}>
            완료된 항목 일괄 삭제 ({stats.completed})
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <TodoApp />
  </ThemeProvider>
);

export default App;
