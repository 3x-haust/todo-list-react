import React, { useState, useEffect, FormEvent } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { Todo, Filter } from "./types";
import { loadTodos, saveTodos } from "./storage";
import "./App.css";

const TodoItem: React.FC<{
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ todo, onToggle, onDelete }) => (
  <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
    <input
      type="checkbox"
      checked={todo.completed}
      onChange={() => onToggle(todo.id)}
    />
    <span className="todo-text">{todo.text}</span>
    <button onClick={() => onDelete(todo.id)} className="delete-btn">
      ✕
    </button>
  </li>
);

const AppContent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
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
    } catch (err) {
      setError("할 일 목록을 저장하는데 실패했습니다.");
      console.error(err);
    }
  }, [todos]);

  const addTodo = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
    };
    setTodos((prev) => [...prev, newTodo]);
    setInputValue("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className={`app-container ${theme}`}>
      <header className="app-header">
        <h1>Todo List</h1>
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label="테마 전환"
        >
          {theme === "dark" ? "☀️ 라이트" : "🌙 다크"}
        </button>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="close-error-btn">
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>로딩 중...</p>
          </div>
        ) : (
          <>
            <form onSubmit={addTodo} className="todo-form">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="할 일을 입력하세요"
                className="todo-input"
              />
              <button type="submit" className="add-btn">
                추가
              </button>
            </form>

            {totalCount === 0 ? (
              <div className="empty-state">
                <p>할 일이 없습니다.</p>
                <p className="empty-hint">위 입력창에 할 일을 추가하세요.</p>
              </div>
            ) : (
              <>
                <div className="filter-bar">
                  {(["all", "active", "completed"] as Filter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`filter-btn ${filter === f ? "active" : ""}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <ul className="todo-list">
                  {filteredTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                    />
                  ))}
                </ul>

                <div className="stats-bar">
                  <span>
                    {completedCount}/{totalCount} 완료
                  </span>
                  {completedCount > 0 && (
                    <button
                      onClick={() => setTodos([])}
                      className="clear-completed-btn"
                    >
                      완료된 항목 삭제
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
