import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Coffee, Settings } from 'lucide-react';

export const Timer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound or notification here
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customMinutes * 60);
  };

  const switchMode = () => {
    const newMode = mode === 'focus' ? 'break' : 'focus';
    const newTime = newMode === 'focus' ? 25 : 5;
    setMode(newMode);
    setCustomMinutes(newTime);
    setTimeLeft(newTime * 60);
    setIsActive(false);
  };

  const saveCustomTime = () => {
    setTimeLeft(customMinutes * 60);
    setIsEditing(false);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center transition-colors duration-300 relative group">
      
      <button 
        onClick={() => setIsEditing(!isEditing)}
        className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Settings size={18} />
      </button>

      <div className="flex items-center space-x-2 mb-4">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          {mode === 'focus' ? 'Focus Mode' : 'Short Break'}
        </h3>
        {mode === 'break' && <Coffee className="w-5 h-5 text-orange-500" />}
      </div>
      
      {isEditing ? (
        <div className="mb-6 flex items-center space-x-2">
            <input 
                type="number" 
                value={customMinutes} 
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                className="w-20 text-center text-3xl font-mono font-bold bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-500">min</span>
            <button onClick={saveCustomTime} className="bg-indigo-500 text-white px-3 py-1 rounded-md text-sm">Set</button>
        </div>
      ) : (
        <div className="text-5xl font-mono font-bold text-slate-900 dark:text-white mb-6 tracking-wider">
            {formatTime(timeLeft)}
        </div>
      )}

      <div className="flex space-x-3 w-full justify-center">
        <button
          onClick={toggleTimer}
          className={`p-3 rounded-full text-white transition-all shadow-md active:scale-95 ${
            isActive 
              ? 'bg-amber-500 hover:bg-amber-600' 
              : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </button>
        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all shadow-md active:scale-95"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>
      
      <button 
        onClick={switchMode}
        className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline decoration-dotted"
      >
        Switch to {mode === 'focus' ? 'Break' : 'Focus'}
      </button>
    </div>
  );
};