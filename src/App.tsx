import React, { useState, useEffect, FormEvent } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { Todo, Filter } from "./types";
import { loadTodos, saveTodos } from "./storage";

const TodoApp: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
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

  return (
    <div className={`app-container ${theme}`}>
      <header className="app-header">
        <h1>할 일 목록</h1>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={`${theme === 'light' ? '다크' : '라이트'}모드로 전환`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      <main className="app-main">
        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="todo-input"
          />
          <button type="submit" className="add-btn">추가</button>
        </form>

        <div className="filter-container">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "전체" : f === "active" ? "활성" : "완료"}
            </button>
          ))}
        </div>

        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <li key={todo.id} className="todo-item">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="todo-checkbox"
              />
              <span className={`todo-text ${todo.completed ? "completed" : ""}`}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="delete-btn"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>

        {todos.length === 0 ? (
          <div className="empty-state">
            <p>할 일이 없습니다.</p>
            <p className="empty-hint">위 입력창에 할 일을 추가하세요.</p>
          </div>
        ) : (
          <footer className="todo-footer">
            <span>
              {completedCount}/{todos.length} 완료
            </span>
          </footer>
        )}
      </main>

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
