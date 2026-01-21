import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { StudyLog } from '../types';
import { Calendar, Edit, Check, TrendingUp } from 'lucide-react';

interface ConsistencyProps {
  logs: StudyLog[];
  onUpdateLog: (date: string, hours: number) => void;
}

export const Consistency: React.FC<ConsistencyProps> = ({ logs, onUpdateLog }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [isEditMode, setIsEditMode] = useState(false);

  // Group logs by month
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    logs.forEach(log => {
      const monthKey = log.date.slice(0, 7); // YYYY-MM
      months[monthKey] = (months[monthKey] || 0) + log.hours;
    });
    
    // Ensure selected month is in the list even if no logs
    if (!months[selectedMonth]) months[selectedMonth] = 0;

    // Convert to array and sort desc
    return Object.entries(months)
        .map(([key, total]) => ({ month: key, total }))
        .sort((a, b) => b.month.localeCompare(a.month));
  }, [logs, selectedMonth]);

  // Data for Chart based on selected month
  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return 0;
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [selectedMonth]);

  const chartData = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    
    const data = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTotal = logs
            .filter(l => l.date === dateStr)
            .reduce((sum, log) => sum + log.hours, 0);
        
        data.push({
            date: dateStr,
            day: day,
            hours: dayTotal
        });
    }
    return data;
  }, [logs, selectedMonth, daysInMonth]);

  const averageHours = useMemo(() => {
    const totalHours = monthlyData.find(d => d.month === selectedMonth)?.total || 0;
    
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7);
    
    let divisor = daysInMonth;
    if (selectedMonth === currentMonthStr) {
        divisor = now.getDate(); // Divide by days passed so far in current month
    }
    
    return divisor === 0 ? 0 : (totalHours / divisor).toFixed(1);
  }, [monthlyData, selectedMonth, daysInMonth]);

  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const handleManualEntryChange = (dateStr: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 24) {
      onUpdateLog(dateStr, num);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in flex flex-col pb-24 md:pb-10">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
           <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1">Consistency Tracker</h2>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Daily focus hours for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatMonthName(selectedMonth)}</span></p>
           </div>
           <div className="flex items-center gap-4 self-end md:self-auto">
             <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Average</span>
                <div className="flex items-center text-emerald-500 font-bold text-lg">
                    <TrendingUp size={16} className="mr-1" />
                    {averageHours}h<span className="text-xs font-normal text-slate-400 ml-1">/day</span>
                </div>
             </div>
             <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm
                ${isEditMode 
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' 
                    : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}
             >
                {isEditMode ? <Check size={16} /> : <Edit size={16} />}
                {isEditMode ? 'Done' : 'Edit'}
             </button>
           </div>
       </div>

       {/* Chart Area or Edit Grid */}
       <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-2 md:p-6 overflow-hidden">
            <div className="h-[400px] w-full">
                {isEditMode ? (
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {chartData.map((d) => (
                                <div key={d.date} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                                    <span className="text-[10px] text-slate-400 font-medium mb-1 uppercase">{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span>
                                    <div className="flex items-center w-full justify-center">
                                        <input 
                                            type="number"
                                            min="0"
                                            max="24"
                                            step="0.5"
                                            value={d.hours || ''}
                                            onChange={(e) => handleManualEntryChange(d.date, e.target.value)}
                                            className="w-full text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-1 py-1 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            placeholder="-"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.1} vertical={false} />
                            <XAxis 
                                dataKey="day" 
                                stroke="#94a3b8" 
                                tick={{fill: '#94a3b8', fontSize: 12}}
                                tickMargin={10}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis 
                                domain={[0, 16]}
                                stroke="#94a3b8" 
                                tick={{fill: '#94a3b8', fontSize: 12}}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                            />
                            <ReferenceLine y={8} stroke="#22c55e" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'Target (8h)', fill: '#22c55e', fontSize: 10 }} />
                            <Line 
                                type="monotone" 
                                dataKey="hours" 
                                stroke="#6366f1" 
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
       </div>

       {/* Monthly Summary */}
       <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">History</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {monthlyData.map((data) => (
                    <button
                        key={data.month}
                        onClick={() => setSelectedMonth(data.month)}
                        className={`p-4 rounded-xl border transition-all text-left group
                            ${selectedMonth === data.month 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                             <Calendar size={18} className={selectedMonth === data.month ? 'text-indigo-200' : 'text-slate-400'} />
                             {selectedMonth === data.month && <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>}
                        </div>
                        <p className={`text-sm font-medium ${selectedMonth === data.month ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {formatMonthName(data.month).split(' ')[0]} '{formatMonthName(data.month).split(' ')[1].slice(2)}
                        </p>
                        <p className={`text-2xl font-bold ${selectedMonth === data.month ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                            {data.total}<span className="text-xs font-normal opacity-70 ml-1">hrs</span>
                        </p>
                    </button>
                ))}
            </div>
       </div>
    </div>
  );
};