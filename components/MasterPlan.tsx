import React, { useState } from 'react';
import { Subject, Chapter } from '../types';
import { CheckCircle2, Circle, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

interface MasterPlanProps {
  chapters: Chapter[];
  onToggleChapter: (id: string) => void;
  onAddChapter: (chapter: Chapter) => void;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (id: string) => void;
}

export const MasterPlan: React.FC<MasterPlanProps> = ({ 
  chapters, onToggleChapter, onAddChapter, onEditChapter, onDeleteChapter 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [subject, setSubject] = useState<Subject>(Subject.FR);
  const [name, setName] = useState('');
  const [hours, setHours] = useState(0);
  const [date, setDate] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setSubject(Subject.FR);
    setName('');
    setHours(0);
    setDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setSubject(chapter.subject);
    setName(chapter.name);
    setHours(chapter.estimatedHours);
    setDate(chapter.plannedDate);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name || !date) return; // Simple validation

    const newChapter: Chapter = {
      id: editingId || Date.now().toString(),
      subject,
      name,
      estimatedHours: hours,
      plannedDate: date,
      isCompleted: editingId ? (chapters.find(c => c.id === editingId)?.isCompleted || false) : false
    };

    if (editingId) {
      onEditChapter(newChapter);
    } else {
      onAddChapter(newChapter);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in relative">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Master Plan</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Add New
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-sm font-semibold">
            <tr>
              <th className="p-4 w-16">Status</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Chapter</th>
              <th className="p-4">Hours</th>
              <th className="p-4">Planned Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {chapters.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="p-4">
                  <button onClick={() => onToggleChapter(c.id)}>
                    {c.isCompleted 
                      ? <CheckCircle2 className="text-green-500 w-5 h-5" /> 
                      : <Circle className="text-slate-300 w-5 h-5 hover:text-indigo-500" />
                    }
                  </button>
                </td>
                <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold text-sm">{c.subject}</td>
                <td className={`p-4 text-slate-900 dark:text-white font-medium ${c.isCompleted ? 'line-through opacity-50' : ''}`}>{c.name}</td>
                {/* Improved visibility for Hours and Date */}
                <td className="p-4 text-slate-700 dark:text-slate-300 text-sm font-medium">{c.estimatedHours}h</td>
                <td className="p-4 text-slate-700 dark:text-slate-300 text-sm font-mono font-medium">{c.plannedDate}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(c)} className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDeleteChapter(c.id)} className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingId ? 'Edit Chapter' : 'Add New Chapter'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chapter Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Consolidation"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Est. Hours</label>
                  <input 
                    type="number" 
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2">
                <Save size={18} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};