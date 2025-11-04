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
    <div className="min-h-screen art-deco-bg art-deco-pattern">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Art Deco Header */}
        <div className="text-center mb-12">
          <h1 className="art-deco-title text-5xl md:text-7xl mb-6">
            ◆ TASK MANAGER ◆
          </h1>
          <p className="art-deco-subtitle text-lg md:text-xl mb-8">
            Elegance in Organization
          </p>
          <div className="flex justify-center items-center space-x-4 mb-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-yellow-400"></div>
            <div className="w-4 h-4 border-2 border-yellow-400 rotate-45"></div>
            <div className="w-8 h-0.5 bg-yellow-400"></div>
            <div className="w-4 h-4 border-2 border-yellow-400 rotate-45"></div>
            <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-yellow-400"></div>
          </div>
        </div>

        {/* Art Deco Add Todo Form */}
        <div className="mb-12">
          <div className="art-deco-card rounded-none p-6 mb-6">
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !showDateTimeInputs && addTodo()}
                placeholder="Enter your distinguished task..."
                className="art-deco-input flex-1 px-6 py-4 rounded-none text-lg"
              />
              <button
                onClick={() => setShowDateTimeInputs(!showDateTimeInputs)}
                className={`px-6 py-4 rounded-none font-medium transition-all border-2 ${
                  showDateTimeInputs 
                    ? 'bg-yellow-400 text-black border-yellow-400' 
                    : 'bg-transparent text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                }`}
                title="Schedule task"
              >
                ⏰
              </button>
              <button
                onClick={addTodo}
                className="art-deco-btn px-8 py-4 rounded-none text-lg font-bold"
              >
                ◆ ADD ◆
              </button>
            </div>
          
            {/* Art Deco Date and Time Inputs */}
            {showDateTimeInputs && (
              <div className="flex gap-4 pt-4 border-t border-yellow-400/30">
                <div className="flex-1">
                  <label className="block text-yellow-400 text-sm font-semibold mb-2 uppercase tracking-wider">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="art-deco-input w-full px-4 py-3 rounded-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-yellow-400 text-sm font-semibold mb-2 uppercase tracking-wider">Due Time</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="art-deco-input w-full px-4 py-3 rounded-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Art Deco Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="art-deco-card rounded-none p-6 text-center art-deco-corner">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{todosInTimeHorizon.length}</div>
            <div className="text-gray-300 text-sm uppercase tracking-widest font-semibold">
              {timeHorizon === 'daily' ? 'Today' : 
               timeHorizon === 'weekly' ? 'This Week' : 
               'This Month'}
            </div>
            <div className="w-8 h-0.5 bg-yellow-400 mx-auto mt-3"></div>
          </div>
          <div className="art-deco-card rounded-none p-6 text-center art-deco-corner">
            <div className="text-3xl font-bold text-orange-400 mb-2">{activeCount}</div>
            <div className="text-gray-300 text-sm uppercase tracking-widest font-semibold">Active</div>
            <div className="w-8 h-0.5 bg-orange-400 mx-auto mt-3"></div>
          </div>
          <div className="art-deco-card rounded-none p-6 text-center art-deco-corner">
            <div className="text-3xl font-bold text-green-400 mb-2">{completedCount}</div>
            <div className="text-gray-300 text-sm uppercase tracking-widest font-semibold">Completed</div>
            <div className="w-8 h-0.5 bg-green-400 mx-auto mt-3"></div>
          </div>
        </div>

        {/* Art Deco Time Horizon Filter */}
        <div className="mb-8">
          <h3 className="text-yellow-400 text-sm font-bold mb-4 text-center uppercase tracking-widest">Time Period</h3>
          <div className="flex justify-center gap-1">
            {(['daily', 'weekly', 'monthly'] as const).map((horizon) => (
              <button
                key={horizon}
                onClick={() => setTimeHorizon(horizon)}
                className={`px-6 py-3 font-bold transition-all uppercase tracking-wider border-2 ${
                  timeHorizon === horizon
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-transparent text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                }`}
              >
                {horizon === 'daily' ? '◆ Today' : 
                 horizon === 'weekly' ? '◆ Week' : 
                 '◆ Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Art Deco Status Filter Buttons */}
        <div className="flex justify-center gap-1 mb-10">
          {(['all', 'active', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-8 py-3 font-bold transition-all uppercase tracking-wider border-2 ${
                filter === filterType
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-transparent text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>

        {/* Art Deco Todo List */}
        <div className="space-y-4 mb-8">
          {filteredTodos.length === 0 ? (
            <div className="art-deco-card rounded-none p-12 text-center">
              <div className="text-6xl mb-6">◆</div>
              <p className="text-gray-300 text-lg uppercase tracking-wider font-semibold">
                {filter === 'all' ? 
                  `No Tasks ${timeHorizon === 'daily' ? 'Today' : timeHorizon === 'weekly' ? 'This Week' : 'This Month'}` :
                 filter === 'active' ? 
                  `No Active Tasks ${timeHorizon === 'daily' ? 'Today' : timeHorizon === 'weekly' ? 'This Week' : 'This Month'}` :
                  `No Completed Tasks ${timeHorizon === 'daily' ? 'Today' : timeHorizon === 'weekly' ? 'This Week' : 'This Month'}`}
              </p>
              <div className="w-16 h-0.5 bg-yellow-400 mx-auto mt-4"></div>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`art-deco-card group flex items-center gap-6 p-6 rounded-none border-l-4 transition-all hover:bg-black/50 ${
                  todo.completed 
                    ? 'opacity-75 border-l-green-400' 
                    : isOverdue(todo)
                    ? 'border-l-red-400 bg-red-900/20'
                    : 'border-l-yellow-400'
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-8 h-8 border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? 'bg-green-400 border-green-400 text-black'
                      : 'border-yellow-400 hover:border-yellow-300 hover:bg-yellow-400 hover:text-black'
                  }`}
                >
                  {todo.completed && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1">
                  <p className={`text-lg font-semibold transition-all ${
                    todo.completed ? 'line-through text-gray-400' : 'text-gray-100'
                  }`}>
                    {todo.text}
                  </p>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-gray-400 text-sm uppercase tracking-wider">
                      Created: {todo.createdAt.toLocaleDateString()} • {todo.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {(todo.dueDate || todo.dueTime) && (
                      <p className={`text-sm flex items-center gap-2 uppercase tracking-wider font-semibold ${
                        isOverdue(todo) ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        <span>{isOverdue(todo) ? '⚠' : '◆'}</span>
                        {isOverdue(todo) ? 'Overdue: ' : 'Due: '}
                        {todo.dueDate && todo.dueDate.toLocaleDateString()}
                        {todo.dueDate && todo.dueTime && ' • '}
                        {todo.dueTime}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-3 text-red-400 hover:text-red-300 hover:bg-red-900/30 border border-red-400/30 hover:border-red-400 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Art Deco Clear Completed Button */}
        {completedCount > 0 && (
          <div className="text-center">
            <button
              onClick={clearCompleted}
              className="px-8 py-4 bg-transparent text-red-400 border-2 border-red-400 hover:bg-red-400 hover:text-black transition-all font-bold uppercase tracking-wider"
            >
              ◆ Clear {completedCount} Completed ◆
            </button>
          </div>
        )}

        {/* Art Deco Footer Decoration */}
        <div className="flex justify-center items-center space-x-4 mt-16 mb-8">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-yellow-400"></div>
          <div className="w-4 h-4 border-2 border-yellow-400 rotate-45"></div>
          <div className="w-8 h-0.5 bg-yellow-400"></div>
          <div className="w-4 h-4 border-2 border-yellow-400 rotate-45"></div>
          <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-yellow-400"></div>
        </div>
      </div>
    </div>
  );
}
























