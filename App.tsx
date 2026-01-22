import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MasterPlan } from './components/MasterPlan';
import { Consistency } from './components/Consistency';
import { Login } from './components/Login';
import { Chapter, ViewState, SPOMExam, Subject, StudyLog } from './types';
import { auth, onAuthStateChanged, signOut } from './firebase';
import * as db from './utils/db';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<any>(() => auth.currentUser);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Data State
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [spomExams, setSpomExams] = useState<SPOMExam[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [caFinalExamDate, setCaFinalExamDate] = useState<string>('');
  const [completionDates, setCompletionDates] = useState<Record<Subject, string>>({
    [Subject.FR]: '', [Subject.AFM]: '', [Subject.AUDIT]: '', [Subject.DT]: '', [Subject.IDT]: '', [Subject.IBS]: '',
  });

  const loadUserDataFromDB = async (uid: string) => {
    try {
      const data = await db.loadUserFullData(uid);
      setChapters(data.chapters || []);
      setSpomExams(data.spomExams || []);
      setLogs(data.logs || []);
      
      if (data.metadata) {
        if (data.metadata.completionDates) setCompletionDates(data.metadata.completionDates);
        if (data.metadata.currentView) setCurrentView(data.metadata.currentView);
        if (data.metadata.caFinalExamDate) setCaFinalExamDate(data.metadata.caFinalExamDate);
      }
      setIsDataLoaded(true);
    } catch (e) {
      console.error("Error loading DB data", e);
    }
  };

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged({}, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUserDataFromDB(currentUser.uid);
      } else {
        setUser(null);
        setIsDataLoaded(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initial load if user is already present from localStorage
  useEffect(() => {
    if (user && !isDataLoaded) {
      loadUserDataFromDB(user.uid);
    }
  }, []);

  // Sync state to IndexedDB on change (debounced)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (!user || !isDataLoaded) return;
    
    // Prevent saving default blank state on initial mount before data is loaded
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const saveData = async () => {
      try {
        await db.updateUserData(user.uid, {
          chapters,
          spomExams,
          logs,
          completionDates,
          currentView,
          caFinalExamDate
        });
      } catch (e) {
        console.error("Error saving to DB", e);
      }
    };

    const timeoutId = setTimeout(saveData, 800); 
    return () => clearTimeout(timeoutId);
  }, [chapters, spomExams, logs, completionDates, currentView, user, caFinalExamDate, isDataLoaded]);

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

  const daysLeft = useMemo(() => {
    if (!caFinalExamDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(caFinalExamDate);
    examDate.setHours(0, 0, 0, 0);
    
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  }, [caFinalExamDate]);

  const handleToggleChapter = (id: string) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, isCompleted: !c.isCompleted } : c));
  };

  const handleAddChapter = (chapter: Chapter) => {
    setChapters(prev => [...prev, chapter]);
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

  const handleAddSpom = (exam: SPOMExam) => {
    setSpomExams(prev => [...prev, exam]);
  };

  const handleDeleteSpom = (id: string) => {
    setSpomExams(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateCompletionDate = (subject: Subject, date: string) => {
    setCompletionDates(prev => ({ ...prev, [subject]: date }));
  };

  const handleUpdateLog = (date: string, hours: number) => {
    setLogs(prev => {
        const existingIndex = prev.findIndex(l => l.date === date);
        if (existingIndex >= 0) {
            if (hours <= 0) return prev.filter((_, i) => i !== existingIndex);
            const newLogs = [...prev];
            newLogs[existingIndex] = { ...newLogs[existingIndex], hours };
            return newLogs;
        } else {
            if (hours <= 0) return prev;
            return [...prev, { id: `log-${Date.now()}`, date, subject: Subject.FR, hours }];
        }
    });
  };

  const handleLogout = () => {
    setUser(null);
    setIsDataLoaded(false);
    signOut();
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    loadUserDataFromDB(userData.uid);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show a clean loading state until data is pulled from IndexedDB
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Syncing your study data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      
      <main className="md:ml-20 lg:ml-64 p-4 md:p-8 pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard 
              chapters={chapters} 
              daysLeft={daysLeft} 
              onToggleChapter={handleToggleChapter}
              spomExams={spomExams}
              onUpdateSpom={handleUpdateSpom}
              onAddSpom={handleAddSpom}
              onDeleteSpom={handleDeleteSpom}
              completionDates={completionDates}
              onUpdateCompletionDate={handleUpdateCompletionDate}
              caFinalExamDate={caFinalExamDate}
              onUpdateExamDate={setCaFinalExamDate}
            />
          )}
          {currentView === 'master-plan' && (
            <MasterPlan 
              chapters={chapters} 
              onToggleChapter={handleToggleChapter}
              onAddChapter={handleAddChapter}
              onEditChapter={handleEditChapter}
              onDeleteChapter={handleDeleteChapter}
            />
          )}
          {currentView === 'consistency' && (
            <Consistency 
              logs={logs} 
              onUpdateLog={handleUpdateLog}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
