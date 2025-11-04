'use client';

import { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  dueTime?: string;
}

export default function TodoTracker() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [timeHorizon, setTimeHorizon] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [showDateTimeInputs, setShowDateTimeInputs] = useState(false);

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      }));
      setTodos(parsedTodos);
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputText.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputText.trim(),
        completed: false,
        createdAt: new Date(),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        dueTime: dueTime || undefined
      };
      setTodos([newTodo, ...todos]);
      setInputText('');
      setDueDate('');
      setDueTime('');
      setShowDateTimeInputs(false);
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const updatedTodo = { ...todo, completed: !todo.completed };
        // If task is being completed and we're not already viewing completed tasks,
        // automatically switch to completed view to show the user their accomplishment
        if (updatedTodo.completed && filter !== 'completed') {
          setTimeout(() => setFilter('completed'), 300); // Small delay for smooth transition
        }
        return updatedTodo;
      }
      return todo;
    }));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const isOverdue = (todo: Todo) => {
    if (!todo.dueDate || todo.completed) return false;
    const now = new Date();
    const dueDateTime = new Date(todo.dueDate);
    
    if (todo.dueTime) {
      const [hours, minutes] = todo.dueTime.split(':').map(Number);
      dueDateTime.setHours(hours, minutes);
    } else {
      // If no time specified, consider it due at end of day
      dueDateTime.setHours(23, 59);
    }
    
    return now > dueDateTime;
  };

  const filteredTodos = todos.filter(todo => {
    // First filter by completion status
    let statusMatch = true;
    if (filter === 'active') statusMatch = !todo.completed;
    if (filter === 'completed') statusMatch = todo.completed;
    
    // Then filter by time horizon
    const now = new Date();
    const todoDate = new Date(todo.createdAt);
    let timeMatch = true;
    
    if (timeHorizon === 'daily') {
      // Show todos from today
      timeMatch = todoDate.toDateString() === now.toDateString();
    } else if (timeHorizon === 'weekly') {
      // Show todos from this week (last 7 days)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      timeMatch = todoDate >= weekAgo;
    } else if (timeHorizon === 'monthly') {
      // Show todos from this month
      timeMatch = todoDate.getMonth() === now.getMonth() && todoDate.getFullYear() === now.getFullYear();
    }
    
    return statusMatch && timeMatch;
  });

  // Calculate stats based on current time horizon
  const todosInTimeHorizon = todos.filter(todo => {
    const now = new Date();
    const todoDate = new Date(todo.createdAt);
    
    if (timeHorizon === 'daily') {
      return todoDate.toDateString() === now.toDateString();
    } else if (timeHorizon === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return todoDate >= weekAgo;
    } else if (timeHorizon === 'monthly') {
      return todoDate.getMonth() === now.getMonth() && todoDate.getFullYear() === now.getFullYear();
    }
    return true;
  });
  
  const completedCount = todosInTimeHorizon.filter(todo => todo.completed).length;
  const activeCount = todosInTimeHorizon.length - completedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400 relative overflow-hidden">
      {/* Dynamic background shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-70 animate-float"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-60 animate-bounce"></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-50 animate-scale-pulse"></div>
      <div className="absolute bottom-40 right-10 w-28 h-28 bg-gradient-to-r from-red-400 to-pink-500 rounded-full opacity-60 animate-wiggle"></div>
      <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-40 animate-float transform -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
            🚀 POWER TODOS
          </h1>
          <p className="text-white text-xl font-bold drop-shadow-lg">
            Crush your goals with style!
          </p>
        </div>

        {/* Add Todo Form */}
        <div className="mb-8">
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !showDateTimeInputs && addTodo()}
              placeholder="What epic task will you conquer?"
              className="flex-1 px-6 py-4 rounded-2xl bg-white text-gray-800 placeholder-gray-500 font-semibold text-lg shadow-2xl border-4 border-transparent focus:outline-none focus:border-cyan-400 focus:shadow-cyan-400/50 transition-all transform focus:scale-105"
            />
            <button
              onClick={() => setShowDateTimeInputs(!showDateTimeInputs)}
              className={`px-5 py-4 rounded-2xl font-bold text-xl transition-all transform hover:scale-110 shadow-xl ${
                showDateTimeInputs 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/50' 
                  : 'bg-white text-gray-800 hover:bg-gray-100 shadow-gray-400/50'
              }`}
              title="Schedule task"
            >
              📅
            </button>
            <button
              onClick={addTodo}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-black text-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none shadow-2xl shadow-green-500/50 transition-all transform hover:scale-110 active:scale-95"
            >
              ADD IT! 💪
            </button>
          </div>
          
          {/* Date and Time Inputs */}
          {showDateTimeInputs && (
            <div className="flex gap-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex-1">
                <label className="block text-white text-sm font-bold mb-2 drop-shadow">📅 Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 font-semibold shadow-xl border-2 border-transparent focus:outline-none focus:border-blue-400 focus:shadow-blue-400/50 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-white text-sm font-bold mb-2 drop-shadow">⏰ Due Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 font-semibold shadow-xl border-2 border-transparent focus:outline-none focus:border-blue-400 focus:shadow-blue-400/50 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-center shadow-2xl shadow-purple-500/50 transform hover:scale-105 transition-all">
            <div className="text-3xl font-black text-white">{todosInTimeHorizon.length}</div>
            <div className="text-white font-bold text-sm">
              {timeHorizon === 'daily' ? '🔥 TODAY' : 
               timeHorizon === 'weekly' ? '⚡ THIS WEEK' : 
               '🚀 THIS MONTH'}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-center shadow-2xl shadow-orange-500/50 transform hover:scale-105 transition-all">
            <div className="text-3xl font-black text-white">{activeCount}</div>
            <div className="text-white font-bold text-sm">💪 ACTIVE</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-center shadow-2xl shadow-green-500/50 transform hover:scale-105 transition-all">
            <div className="text-3xl font-black text-white">{completedCount}</div>
            <div className="text-white font-bold text-sm">✅ CRUSHED</div>
          </div>
        </div>

        {/* Time Horizon Filter */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-black mb-4 text-center drop-shadow">⏰ TIME SCOPE</h3>
          <div className="flex justify-center gap-3">
            {(['daily', 'weekly', 'monthly'] as const).map((horizon) => (
              <button
                key={horizon}
                onClick={() => setTimeHorizon(horizon)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 ${
                  timeHorizon === horizon
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-2xl shadow-cyan-500/50'
                    : 'bg-white text-gray-800 hover:bg-gray-100 shadow-xl'
                }`}
              >
                {horizon === 'daily' ? '🔥 TODAY' : 
                 horizon === 'weekly' ? '⚡ WEEK' : 
                 '🚀 MONTH'}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex justify-center gap-3 mb-8">
          {(['all', 'active', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 uppercase ${
                filter === filterType
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-2xl shadow-pink-500/50'
                  : 'bg-white text-gray-800 hover:bg-gray-100 shadow-xl'
              }`}
            >
              {filterType === 'all' ? '🌟 ALL' : 
               filterType === 'active' ? '💪 ACTIVE' : 
               '✅ DONE'}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-4 mb-8">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 animate-bounce">🎯</div>
              <p className="text-white text-xl font-bold drop-shadow-lg">
                {filter === 'all' ? 
                  `Ready to conquer ${timeHorizon === 'daily' ? 'today' : timeHorizon === 'weekly' ? 'this week' : 'this month'}? Add your first epic task!` :
                 filter === 'active' ? 
                  `All caught up! No active tasks ${timeHorizon === 'daily' ? 'today' : timeHorizon === 'weekly' ? 'this week' : 'this month'}! 🎉` :
                  `No victories yet ${timeHorizon === 'daily' ? 'today' : timeHorizon === 'weekly' ? 'this week' : 'this month'}! Time to crush some goals! 💪`}
              </p>
            </div>
          ) : (
            filteredTodos.map((todo, index) => (
              <div
                key={todo.id}
                className={`group flex items-center gap-4 p-6 rounded-2xl shadow-2xl border-2 transition-all transform hover:scale-102 ${
                  todo.completed 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-300 opacity-90' 
                    : isOverdue(todo)
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 border-red-300 animate-pulse'
                    : index % 4 === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-300'
                    : index % 4 === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-300'
                    : index % 4 === 2 ? 'bg-gradient-to-r from-orange-500 to-yellow-500 border-orange-300'
                    : 'bg-gradient-to-r from-green-500 to-teal-500 border-green-300'
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all transform hover:scale-110 ${
                    todo.completed
                      ? 'bg-white text-green-600 border-white shadow-lg'
                      : 'border-white/80 hover:border-white bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {todo.completed && (
                    <svg className="w-5 h-5 font-bold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1">
                  <p className={`text-white font-bold text-lg transition-all ${
                    todo.completed ? 'line-through opacity-75' : ''
                  }`}>
                    {todo.text}
                  </p>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-white/80 text-sm font-medium">
                      📅 {todo.createdAt.toLocaleDateString()} • ⏰ {todo.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {(todo.dueDate || todo.dueTime) && (
                      <p className={`text-sm flex items-center gap-2 font-bold ${
                        isOverdue(todo) ? 'text-yellow-200 animate-pulse' : 'text-white/90'
                      }`}>
                        <span className="text-lg">{isOverdue(todo) ? '🚨' : '🎯'}</span>
                        {isOverdue(todo) ? 'OVERDUE: ' : 'TARGET: '}
                        {todo.dueDate && todo.dueDate.toLocaleDateString()}
                        {todo.dueDate && todo.dueTime && ' • '}
                        {todo.dueTime}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-3 text-white hover:text-red-200 hover:bg-red-500/30 rounded-xl transition-all transform hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Clear Completed Button */}
        {completedCount > 0 && (
          <div className="text-center">
            <button
              onClick={clearCompleted}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-black text-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-2xl shadow-red-500/50"
            >
              🗑️ CLEAR {completedCount} COMPLETED TASK{completedCount !== 1 ? 'S' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


























