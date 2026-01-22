import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Subject, Chapter, SUBJECT_COLORS, SPOMExam } from '../types';
import { CheckCircle2, Circle, Clock, TrendingUp, Award, Calendar, Plus, Trash2 } from 'lucide-react';
import { Timer } from './Timer';
import { SPOM_SET_C_SUBJECTS, SPOM_SET_D_SUBJECTS } from '../constants';

interface DashboardProps {
  chapters: Chapter[];
  daysLeft: number | null;
  onToggleChapter: (id: string) => void;
  spomExams: SPOMExam[];
  onUpdateSpom: (id: string, field: keyof SPOMExam, value: any) => void;
  onAddSpom: (exam: SPOMExam) => void;
  onDeleteSpom: (id: string) => void;
  completionDates: Record<Subject, string>;
  onUpdateCompletionDate: (subject: Subject, date: string) => void;
  caFinalExamDate: string;
  onUpdateExamDate: (date: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    chapters, daysLeft, onToggleChapter, spomExams, onUpdateSpom, onAddSpom, onDeleteSpom, 
    completionDates, onUpdateCompletionDate, caFinalExamDate, onUpdateExamDate 
}) => {
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(c => c.isCompleted).length;
  const progress = Math.round((completedChapters / totalChapters) * 100) || 0;

  const subjectStats = Object.values(Subject).map(sub => {
    const subChapters = chapters.filter(c => c.subject === sub);
    const done = subChapters.filter(c => c.isCompleted).length;
    const total = subChapters.length;
    return {
      subject: sub,
      done,
      total,
      percent: total === 0 ? 0 : Math.round((done / total) * 100)
    };
  });

  const todaysFocus = chapters.filter(c => !c.isCompleted).slice(0, 4);

  const ringData = [
    { name: 'Completed', value: completedChapters },
    { name: 'Remaining', value: totalChapters - completedChapters }
  ];

  const getProgressBarColor = (percent: number) => {
    if (percent === 100) return '#22C55E'; 
    if (percent >= 50) return '#EAB308'; 
    return '#EF4444'; 
  };

  const handleAddExam = () => {
      const id = `spom-${Date.now()}`;
      onAddSpom({ id, set: 'Set A', subject: '', marks: '', status: 'Pending' });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-10">
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Countdown Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden h-48 md:h-auto min-h-[180px]">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Clock size={80} className="md:w-[100px] md:h-[100px]" />
          </div>
          <div className="relative z-10">
            <h2 className="text-indigo-100 font-medium">CA Final Exam</h2>
            <div className="mt-1 flex items-center gap-2">
                <input 
                    type="date"
                    value={caFinalExamDate}
                    onChange={(e) => onUpdateExamDate(e.target.value)}
                    className="bg-white/10 hover:bg-white/20 transition-colors border border-white/20 rounded px-2 py-1 text-sm text-white font-medium outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                />
            </div>
          </div>
          <div className="relative z-10">
            {daysLeft !== null ? (
                <>
                    <span className="text-5xl md:text-6xl font-bold tracking-tighter">{daysLeft}</span>
                    <span className="text-lg md:text-xl ml-2 font-medium opacity-80">Days Left</span>
                </>
            ) : (
                <span className="text-xl md:text-2xl font-bold opacity-60">Set Exam Date Above</span>
            )}
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex flex-col">
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Overall Progress</h3>
                <span className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mt-2">{progress}%</span>
                <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{completedChapters} of {totalChapters} Chapters</span>
            </div>
            <div className="h-28 w-28 md:h-32 md:w-32 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={ringData}
                            cx="50%"
                            cy="50%"
                            innerRadius={isMobile ? 28 : 35}
                            outerRadius={isMobile ? 40 : 50}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell fill="#6366f1" />
                            <Cell fill="#e2e8f0" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-400">
                    Target
                </div>
            </div>
        </div>

        <div className="md:col-span-2 xl:col-span-1">
            <Timer />
        </div>
      </div>

       {/* SPOM Exams Tracker */}
       <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-md border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white flex items-center">
                <Award className="mr-2 text-amber-500" /> SPOM Exams
            </h2>
            <button 
                onClick={handleAddExam}
                className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-1 transition-all"
            >
                <Plus size={14} /> Add Exam
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm">
                  <th className="py-3 px-3 w-20 font-semibold">Set</th>
                  <th className="py-3 px-3 font-semibold">Subject</th>
                  <th className="py-3 px-3 w-32 font-semibold">Status</th>
                  <th className="py-3 px-3 w-24 font-semibold text-center">Marks</th>
                  <th className="py-3 px-3 w-10 font-semibold text-center"></th>
                </tr>
              </thead>
              <tbody>
                {spomExams.length > 0 ? spomExams.map((exam) => (
                  <tr key={exam.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-3 align-middle">
                        <select 
                            value={exam.set}
                            onChange={(e) => onUpdateSpom(exam.id, 'set', e.target.value)}
                            className="bg-transparent border-none p-0 text-base font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-0 cursor-pointer appearance-none"
                        >
                            <option value="Set A">Set A</option>
                            <option value="Set B">Set B</option>
                            <option value="Set C">Set C</option>
                            <option value="Set D">Set D</option>
                        </select>
                    </td>
                    <td className="py-4 px-3 align-middle">
                        {exam.set === 'Set C' ? (
                            <div className="relative">
                                <select 
                                    value={exam.subject}
                                    onChange={(e) => onUpdateSpom(exam.id, 'subject', e.target.value)}
                                    className="w-full bg-transparent border-none p-0 text-base font-medium text-slate-900 dark:text-white outline-none focus:ring-0 cursor-pointer font-sans appearance-none"
                                >
                                    <option value="" disabled className="text-slate-400">Select Subject</option>
                                    {SPOM_SET_C_SUBJECTS.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
                                </select>
                            </div>
                        ) : exam.set === 'Set D' ? (
                             <div className="relative">
                                 <select 
                                    value={exam.subject}
                                    onChange={(e) => onUpdateSpom(exam.id, 'subject', e.target.value)}
                                    className="w-full bg-transparent border-none p-0 text-base font-medium text-slate-900 dark:text-white outline-none focus:ring-0 cursor-pointer font-sans appearance-none"
                                >
                                    <option value="" disabled className="text-slate-400">Select Subject</option>
                                    {SPOM_SET_D_SUBJECTS.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
                                </select>
                             </div>
                        ) : (
                            <input 
                                type="text"
                                value={exam.subject}
                                onChange={(e) => onUpdateSpom(exam.id, 'subject', e.target.value)}
                                placeholder="Enter subject name..."
                                className="w-full bg-transparent border-none p-0 text-base font-medium text-slate-900 dark:text-white outline-none focus:ring-0"
                            />
                        )}
                    </td>
                    <td className="py-4 px-3 align-middle">
                      <select 
                        value={exam.status}
                        onChange={(e) => onUpdateSpom(exam.id, 'status', e.target.value)}
                        className={`text-sm rounded-lg px-3 py-1.5 border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer font-bold appearance-none w-full text-center shadow-sm
                          ${exam.status === 'Pass' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                            exam.status === 'Fail' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </td>
                    <td className="py-4 px-3 align-middle">
                      <input 
                        type="text" 
                        value={exam.marks} 
                        onChange={(e) => onUpdateSpom(exam.id, 'marks', e.target.value)}
                        placeholder="--"
                        className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:outline-none text-center text-base font-medium text-slate-900 dark:text-white"
                      />
                    </td>
                    <td className="py-4 px-3 align-middle text-center">
                        <button onClick={() => onDeleteSpom(exam.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400 italic">No exams added yet. Click "Add Exam" to start tracking.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
       </div>

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-4 md:mb-6 flex items-center">
            <TrendingUp className="mr-2 w-6 h-6 text-indigo-500" /> Subject Breakdown
        </h2>
        {totalChapters > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {subjectStats.map((stat) => (
                    <div key={stat.subject} className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 min-w-0 pr-2">
                                <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-100 truncate">{stat.subject}</h4>
                            </div>
                            <span 
                                className="px-2 py-1 rounded text-xs font-bold text-white shrink-0"
                                style={{ backgroundColor: SUBJECT_COLORS[stat.subject] }}
                            >
                                {stat.subject === Subject.AFM ? 'AFM' : 
                                stat.subject === Subject.FR ? 'FR' :
                                stat.subject === Subject.AUDIT ? 'AUDIT' : 'SUB'}
                            </span>
                        </div>
                        
                        <div className="mb-4 flex items-center bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700">
                            <Calendar size={14} className="text-slate-500 dark:text-slate-400 mr-2" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mr-2">Est. End:</span>
                            <input 
                                type="date"
                                value={completionDates[stat.subject] || ''}
                                onChange={(e) => onUpdateCompletionDate(stat.subject, e.target.value)}
                                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 font-medium">
                                <span>Progress</span>
                                <span className="text-slate-800 dark:text-white">{stat.percent}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div 
                                    className="h-2 rounded-full transition-all"
                                    style={{ 
                                        width: `${stat.percent}%`, 
                                        backgroundColor: getProgressBarColor(stat.percent)
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-right mt-1 font-medium">
                                {stat.done} / {stat.total} Chapters
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 text-lg mb-2">No subjects found.</p>
                <p className="text-slate-500 text-sm">Head to the <span className="font-bold text-indigo-500">Master Plan</span> tab to add your chapters and subjects.</p>
            </div>
        )}
      </div>

      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4">Today's Targets</h2>
        <div className="space-y-3">
            {todaysFocus.length > 0 ? todaysFocus.map(chapter => (
                <div 
                    key={chapter.id} 
                    className="flex items-center p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer group"
                    onClick={() => onToggleChapter(chapter.id)}
                >
                    <div className={`mr-4 transition-colors ${chapter.isCompleted ? 'text-green-500' : 'text-slate-300 group-hover:text-indigo-400'}`}>
                        {chapter.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </div>
                    <div>
                        <p className={`font-medium text-base transition-all ${chapter.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                            {chapter.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{chapter.subject} • {chapter.estimatedHours}h est.</p>
                    </div>
                </div>
            )) : (
                <div className="p-8 text-center text-slate-400 italic">
                    {totalChapters === 0 ? "No chapters planned yet. Start by adding chapters in the Master Plan." : "All planned tasks completed! Great job."}
                </div>
            )}
        </div>
      </div>

    </div>
  );
};
