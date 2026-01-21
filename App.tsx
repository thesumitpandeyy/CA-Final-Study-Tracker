import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MasterPlan } from './components/MasterPlan';
import { Consistency } from './components/Consistency';
import { MOCK_CHAPTERS, MOCK_LOGS, EXAM_START_DATE, INITIAL_SPOM_EXAMS } from './constants';
import { Chapter, ViewState, SPOMExam, Subject, StudyLog } from './types';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [chapters, setChapters] = useState<Chapter[]>(MOCK_CHAPTERS);
  const [spomExams, setSpomExams] = useState<SPOMExam[]>(INITIAL_SPOM_EXAMS);
  const [logs, setLogs] = useState<StudyLog[]>(MOCK_LOGS);
  const [completionDates, setCompletionDates] = useState<Record<Subject, string>>({
    [Subject.FR]: '',
    [Subject.AFM]: '',
    [Subject.AUDIT]: '',
    [Subject.DT]: '',
    [Subject.IDT]: '',
    [Subject.IBS]: '',
  });

  // Theme Handling
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Logic
  const daysLeft = useMemo(() => {
    const today = new Date();
    const diffTime = Math.abs(EXAM_START_DATE.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }, []);

  const handleToggleChapter = (id: string) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, isCompleted: !c.isCompleted } : c));
  };

  const handleAddChapter = (chapter: Chapter) => {
    setChapters([...chapters, chapter]);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setChapters(prev => prev.map(c => c.id === chapter.id ? chapter : c));
  };

  const handleDeleteChapter = (id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateSpom = (id: string, field: keyof SPOMExam, value: any) => {
    setSpomExams(prev => prev.map(exam => exam.id === id ? { ...exam, [field]: value } : exam));
  };

  const handleUpdateCompletionDate = (subject: Subject, date: string) => {
    setCompletionDates(prev => ({
        ...prev,
        [subject]: date
    }));
  };

  const handleUpdateLog = (date: string, hours: number) => {
    setLogs(prev => {
        // Check if log exists for this date
        const existingIndex = prev.findIndex(l => l.date === date);
        if (existingIndex >= 0) {
            // Update existing
            if (hours <= 0) {
                // Remove if 0
                return prev.filter((_, i) => i !== existingIndex);
            }
            const newLogs = [...prev];
            newLogs[existingIndex] = { ...newLogs[existingIndex], hours };
            return newLogs;
        } else {
            // Add new
            if (hours <= 0) return prev;
            return [...prev, {
                id: `log-${Date.now()}`,
                date,
                subject: Subject.FR, // Default subject for consistency logs
                hours
            }];
        }
    });
  };

  // Render Views
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            chapters={chapters} 
            daysLeft={daysLeft} 
            onToggleChapter={handleToggleChapter}
            spomExams={spomExams}
            onUpdateSpom={handleUpdateSpom}
            completionDates={completionDates}
            onUpdateCompletionDate={handleUpdateCompletionDate}
          />
        );
      case 'master-plan':
        return (
          <MasterPlan 
            chapters={chapters} 
            onToggleChapter={handleToggleChapter}
            onAddChapter={handleAddChapter}
            onEditChapter={handleEditChapter}
            onDeleteChapter={handleDeleteChapter}
          />
        );
      case 'consistency':
        return (
          <Consistency 
            logs={logs} 
            onUpdateLog={handleUpdateLog}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      {/* 
         Adjusted Margins for Mobile/Desktop 
         Mobile: ml-0 (Bottom Nav handles navigation)
         Desktop: ml-20 or lg:ml-64 (Sidebar handles navigation)
         Removed h-full from inner container to allow natural scrolling
      */}
      <main className="md:ml-20 lg:ml-64 p-4 md:p-8 pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;