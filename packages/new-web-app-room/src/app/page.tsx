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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            ✨ Todo Tracker
          </h1>
          <p className="text-purple-200 text-lg">
            Beautiful task management made simple
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
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            />
            <button
              onClick={() => setShowDateTimeInputs(!showDateTimeInputs)}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                showDateTimeInputs 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
              title="Schedule task"
            >
              📅
            </button>
            <button
              onClick={addTodo}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all transform hover:scale-105"
            >
              Add
            </button>
          </div>
          
          {/* Date and Time Inputs */}
          {showDateTimeInputs && (
            <div className="flex gap-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex-1">
                <label className="block text-purple-200 text-sm mb-1">Due Date (optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-purple-200 text-sm mb-1">Due Time (optional)</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-white">{todosInTimeHorizon.length}</div>
            <div className="text-purple-200 text-sm">
              {timeHorizon === 'daily' ? 'Today' : 
               timeHorizon === 'weekly' ? 'This Week' : 
               'This Month'}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-yellow-300">{activeCount}</div>
            <div className="text-purple-200 text-sm">Active</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-green-300">{completedCount}</div>
            <div className="text-purple-200 text-sm">Done</div>
          </div>
        </div>

        {/* Time Horizon Filter */}
        <div className="mb-4">
          <h3 className="text-white text-sm font-medium mb-3 text-center">Time Period</h3>
          <div className="flex justify-center gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map((horizon) => (
              <button
                key={horizon}
                onClick={() => setTimeHorizon(horizon)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  timeHorizon === horizon
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20'
                }`}
              >
                {horizon === 'daily' ? '📅 Today' : 
                 horizon === 'weekly' ? '📊 This Week' : 
                 '📆 This Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex justify-center gap-2 mb-6">
          {(['all', 'active', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                filter === filterType
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-3 mb-6">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-purple-200 text-lg">
                {filter === 'all' ? 
                  `No todos ${timeHorizon === 'daily' ? 'today' : timeHorizon === 'weekly' ? 'this week' : 'this month'}. Add one above!` :
                 filter === 'active' ? 
                  `No active todos ${timeHorizon === 'daily' ? 'today' : timeHorizon === 'weekly' ? 'this week' : 'this month'}!` :
                  `No completed todos ${timeHorizon === 'daily' ? 'today' : timeHorizon === 'weekly' ? 'this week' : 'this month'}!`}
              </p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`group flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm border transition-all hover:bg-white/15 ${
                  todo.completed 
                    ? 'opacity-75 bg-white/10 border-white/20' 
                    : isOverdue(todo)
                    ? 'bg-red-500/20 border-red-400/50'
                    : 'bg-white/10 border-white/20'
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-white/40 hover:border-purple-400'
                  }`}
                >
                  {todo.completed && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1">
                  <p className={`text-white transition-all ${
                    todo.completed ? 'line-through text-white/60' : ''
                  }`}>
                    {todo.text}
                  </p>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-purple-300 text-sm">
                      Created: {todo.createdAt.toLocaleDateString()} at {todo.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {(todo.dueDate || todo.dueTime) && (
                      <p className={`text-sm flex items-center gap-1 ${
                        isOverdue(todo) ? 'text-red-300 font-medium' : 'text-yellow-300'
                      }`}>
                        <span>{isOverdue(todo) ? '🚨' : '⏰'}</span>
                        {isOverdue(todo) ? 'Overdue: ' : 'Due: '}
                        {todo.dueDate && todo.dueDate.toLocaleDateString()}
                        {todo.dueDate && todo.dueTime && ' at '}
                        {todo.dueTime}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
              className="px-6 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30"
            >
              Clear {completedCount} completed task{completedCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

















