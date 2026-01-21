export enum Subject {
  FR = 'Financial Reporting',
  AFM = 'Adv. Financial Mgmt',
  AUDIT = 'Adv. Auditing',
  DT = 'Direct Tax',
  IDT = 'Indirect Tax',
  IBS = 'Int. Business Solutions'
}

export const SUBJECT_COLORS: Record<Subject, string> = {
  [Subject.FR]: '#3B82F6',
  [Subject.AFM]: '#10B981',
  [Subject.AUDIT]: '#8B5CF6',
  [Subject.DT]: '#F97316',
  [Subject.IDT]: '#EC4899',
  [Subject.IBS]: '#64748B',
};

export const SUBJECT_KEYS: Record<Subject, string> = {
  [Subject.FR]: 'fr',
  [Subject.AFM]: 'afm',
  [Subject.AUDIT]: 'audit',
  [Subject.DT]: 'dt',
  [Subject.IDT]: 'idt',
  [Subject.IBS]: 'ibs',
};

export interface Chapter {
  id: string;
  subject: Subject;
  name: string;
  isCompleted: boolean;
  plannedDate: string; // ISO Date string
  estimatedHours: number;
}

export interface SPOMExam {
  id: string;
  set: string;
  subject: string;
  marks: string; // Using string to easily handle empty input state
  status: 'Pending' | 'Pass' | 'Fail';
}

export interface StudyLog {
  id: string;
  date: string; // ISO Date string
  subject: Subject;
  hours: number;
}

export interface AuditTask {
  day: number;
  topic: string;
  completed: boolean;
}

export type ViewState = 'dashboard' | 'master-plan' | 'consistency';