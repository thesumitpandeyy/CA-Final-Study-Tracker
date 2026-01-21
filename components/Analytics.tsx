import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { StudyLog, Chapter, Subject, SUBJECT_COLORS, SUBJECT_KEYS } from '../types';

interface AnalyticsProps {
  logs: StudyLog[];
  chapters: Chapter[];
  daysLeft: number;
}

export const Analytics: React.FC<AnalyticsProps> = ({ logs, chapters, daysLeft }) => {
  
  // Prepare Data for Stacked Bar Chart (Last 7 Days)
  const barData = useMemo(() => {
    const data: any[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayLogs = logs.filter(l => l.date === dateStr);
      
      const entry: any = { date: dateStr.slice(5) }; // MM-DD
      Object.values(Subject).forEach(sub => {
        entry[sub] = dayLogs.filter(l => l.subject === sub).reduce((acc, curr) => acc + curr.hours, 0);
      });
      data.push(entry);
    }
    return data;
  }, [logs]);

  // Prepare Data for Burn Down Chart
  const burnDownData = useMemo(() => {
    const totalChapters = chapters.length;
    const completed = chapters.filter(c => c.isCompleted).length;
    const remaining = totalChapters - completed;
    
    // Simulating a linear burn down for visual purposes based on dates
    // In a real app, this would use historical completion data
    return [
      { name: 'Start', ideal: totalChapters, actual: totalChapters },
      { name: 'Today', ideal: totalChapters - (totalChapters * 0.3), actual: remaining }, // varied
      { name: 'Exam', ideal: 0, actual: 0 }
    ];
  }, [chapters]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Productivity Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Study Hours (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{fill: 'transparent'}}
                />
                <Legend iconType="circle" />
                {Object.values(Subject).map((sub) => (
                  <Bar key={sub} dataKey={sub} stackId="a" fill={SUBJECT_COLORS[sub]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Burn Down Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Chapter Burn Down</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burnDownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" name="Ideal Path" />
                <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={3} name="Actual Remaining" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};