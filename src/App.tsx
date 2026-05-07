import { FormEvent, useEffect, useMemo, useState } from "react";
import "./App.css";
import { loadTodos, saveTodos } from "./storage";
import type { Filter, Priority, Todo } from "./types";

const priorityLabels: Record<Priority, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

const filterLabels: Record<Filter, string> = {
  all: "전체",
  active: "진행 중",
  completed: "완료",
};

const priorityOrder: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const createTaskId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const stats = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    const active = todos.length - completed;
    const progress = todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100);

    return { active, completed, progress, total: todos.length };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return todos
      .filter((todo) => {
        if (filter === "active") {
          return !todo.completed;
        }

        if (filter === "completed") {
          return todo.completed;
        }

        return true;
      })
      .filter((todo) => todo.title.toLowerCase().includes(normalizedSearch))
      .sort((left, right) => {
        if (left.completed !== right.completed) {
          return left.completed ? 1 : -1;
        }

        return priorityOrder[left.priority] - priorityOrder[right.priority];
      });
  }, [filter, searchTerm, todos]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTitle = title.trim();
    if (!nextTitle) {
      return;
    }

    const nextTodo: Todo = {
      id: createTaskId(),
      title: nextTitle,
      completed: false,
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
    };

    setTodos((currentTodos) => [nextTodo, ...currentTodos]);
    setTitle("");
    setPriority("medium");
    setDueDate("");
  };

  const toggleTodo = (id: string) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  };

  const completeAll = () => {
    setTodos((currentTodos) => currentTodos.map((todo) => ({ ...todo, completed: true })));
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="app-shell">
      <section className="hero-panel" aria-labelledby="app-title">
        <div className="hero-copy">
          <p className="eyebrow">Personal task board</p>
          <h1 id="app-title">할 일을 우선순위로 정리하세요.</h1>
          <p className="hero-description">
            검색, 필터, 마감일, 우선순위, 진행률을 지원하는 TypeScript 투두 앱입니다.
          </p>
        </div>

        <div className="progress-card" aria-label="진행률">
          <span>{stats.progress}%</span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${stats.progress}%` }} />
          </div>
          <p>
            완료 {stats.completed}개 / 전체 {stats.total}개
          </p>
        </div>
      </section>

      <section className="task-board" aria-label="할 일 관리">
        <form className="task-form" onSubmit={handleSubmit}>
          <label className="field wide-field">
            <span>새 작업</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 포트폴리오 README 정리"
            />
          </label>

          <label className="field">
            <span>우선순위</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </label>

          <label className="field">
            <span>마감일</span>
            <input value={dueDate} onChange={(event) => setDueDate(event.target.value)} type="date" />
          </label>

          <button className="primary-button" type="submit">
            추가
          </button>
        </form>

        <div className="toolbar">
          <div className="search-box">
            <span aria-hidden="true">/</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="작업 검색"
              aria-label="작업 검색"
            />
          </div>

          <div className="filter-group" aria-label="작업 필터">
            {(Object.keys(filterLabels) as Filter[]).map((filterKey) => (
              <button
                className={filter === filterKey ? "filter-chip active" : "filter-chip"}
                key={filterKey}
                onClick={() => setFilter(filterKey)}
                type="button"
              >
                {filterLabels[filterKey]}
              </button>
            ))}
          </div>
        </div>

        <div className="stat-grid">
          <article>
            <strong>{stats.total}</strong>
            <span>전체</span>
          </article>
          <article>
            <strong>{stats.active}</strong>
            <span>진행 중</span>
          </article>
          <article>
            <strong>{stats.completed}</strong>
            <span>완료</span>
          </article>
        </div>

        <div className="bulk-actions">
          <button onClick={completeAll} type="button" disabled={todos.length === 0}>
            모두 완료
          </button>
          <button onClick={clearCompleted} type="button" disabled={stats.completed === 0}>
            완료 삭제
          </button>
        </div>

        <ul className="task-list">
          {visibleTodos.map((todo) => {
            const isOverdue = Boolean(todo.dueDate) && todo.dueDate < today && !todo.completed;

            return (
              <li className={todo.completed ? "task-item completed" : "task-item"} key={todo.id}>
                <label className="task-check">
                  <input
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    type="checkbox"
                    aria-label={`${todo.title} 완료 상태 변경`}
                  />
                  <span />
                </label>

                <div className="task-content">
                  <div className="task-title-row">
                    <strong>{todo.title}</strong>
                    <span className={`priority-badge ${todo.priority}`}>
                      {priorityLabels[todo.priority]}
                    </span>
                  </div>
                  <p>
                    {todo.dueDate ? `마감 ${todo.dueDate}` : "마감일 없음"}
                    {isOverdue ? " · 지연" : ""}
                  </p>
                </div>

                <button className="delete-button" onClick={() => deleteTodo(todo.id)} type="button">
                  삭제
                </button>
              </li>
            );
          })}
        </ul>

        {visibleTodos.length === 0 ? (
          <div className="empty-state">
            <strong>표시할 작업이 없습니다.</strong>
            <p>새 작업을 추가하거나 검색/필터 조건을 바꿔보세요.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default App;
