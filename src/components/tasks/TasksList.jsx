import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Settings } from 'lucide-react';
import { getSetting, setSetting } from '../../modules/storage';
import { useApp } from '../../context/AppContext';

export function TasksList() {
  const { dispatch } = useApp();
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    getSetting('tasks', []).then(t => setTasks(t || []));
  }, []);

  const persist = (next) => {
    setTasks(next);
    setSetting('tasks', next);
  };

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    persist([...tasks, { id: Date.now(), text, done: false, createdAt: Date.now() }]);
    setInput('');
  };

  const toggle = (id) => persist(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id) => persist(tasks.filter(t => t.id !== id));

  const active = tasks.filter(t => !t.done);
  const done   = tasks.filter(t => t.done);

  return (
    <div className="flex flex-col h-full bg-black">

      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-3 shrink-0">
        <div className="flex-1" />
        <h1 className="text-lg font-semibold text-white tracking-tight">Tasks</h1>
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'settings' })}
            className="btn-icon"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex gap-2 items-center bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Add a task..."
            className="flex-1 bg-transparent text-white placeholder-neutral-600 text-sm outline-none"
          />
          <button
            onClick={addTask}
            className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shrink-0 hover:bg-amber-300 transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} className="text-black" />
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3 text-center">
            <CheckCircle2 size={40} className="text-neutral-800" />
            <p className="text-neutral-600 text-sm">No tasks yet</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {active.map(task => (
                  <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
                ))}
              </div>
            )}

            {done.length > 0 && (
              <>
                <p className="text-neutral-700 text-xs font-medium uppercase tracking-widest mb-2 mt-4">
                  Completed · {done.length}
                </p>
                <div className="space-y-1.5">
                  {done.map(task => (
                    <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onRemove }) {
  return (
    <div className="flex items-center gap-3 bg-neutral-900 rounded-2xl px-4 py-3.5 group">
      <button onClick={() => onToggle(task.id)} className="shrink-0 transition-transform active:scale-90">
        {task.done
          ? <CheckCircle2 size={20} className="text-amber-400" />
          : <Circle size={20} className="text-neutral-600" />
        }
      </button>
      <span className={`flex-1 text-sm leading-snug ${task.done ? 'line-through text-neutral-600' : 'text-neutral-200'}`}>
        {task.text}
      </span>
      <button
        onClick={() => onRemove(task.id)}
        className="opacity-0 group-hover:opacity-100 text-neutral-700 hover:text-red-400 transition-all"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
