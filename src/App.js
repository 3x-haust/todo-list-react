import React, { useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ color: '#61dafb' }}>My Todo List</h1>
        <form onSubmit={addTodo} style={{ marginBottom: '20px' }}>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="할 일을 입력하세요..."
            style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: 'none', marginRight: '10px' }}
          />
          <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: '#61dafb', color: '#282c34', fontWeight: 'bold' }}>추가</button>
        </form>
        <ul style={{ listStyle: 'none', padding: 0, width: '300px' }}>
          {todos.map(todo => (
            <li key={todo.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              backgroundColor: '#282c34', 
              margin: '10px 0', 
              padding: '10px', 
              borderRadius: '4px',
              borderLeft: todo.completed ? '5px solid #4caf50' : '5px solid #f44336'
            }}>
              <span 
                onClick={() => toggleTodo(todo.id)} 
                style={{ 
                  textDecoration: todo.completed ? 'line-truth' : 'none', 
                  textDecorationLine: todo.completed ? 'line-through' : 'none',
                  cursor: 'pointer',
                  flexGrow: 1,
                  textAlign: 'left'
                }}
              >
                {todo.text}
              </span>
              <button 
                onClick={() => deleteTodo(todo.id)} 
                style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer', backgroundColor: '#ff5252', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
