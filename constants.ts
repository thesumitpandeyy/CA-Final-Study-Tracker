import { Subject, Chapter, StudyLog, AuditTask, SPOMExam } from './types';

export const EXAM_START_DATE = new Date('2028-05-01T09:00:00');

export const MOCK_CHAPTERS: Chapter[] = [
  // FR
  { id: '1', subject: Subject.FR, name: 'Ind AS 115: Revenue', isCompleted: true, plannedDate: '2024-06-01', estimatedHours: 12 },
  { id: '2', subject: Subject.FR, name: 'Ind AS 116: Leases', isCompleted: true, plannedDate: '2024-06-05', estimatedHours: 8 },
  { id: '3', subject: Subject.FR, name: 'Consolidation', isCompleted: false, plannedDate: '2024-06-15', estimatedHours: 20 },
  { id: '4', subject: Subject.FR, name: 'Financial Instruments', isCompleted: false, plannedDate: '2024-06-25', estimatedHours: 18 },
  
  // AFM
  { id: '5', subject: Subject.AFM, name: 'Forex Management', isCompleted: true, plannedDate: '2024-06-10', estimatedHours: 15 },
  { id: '6', subject: Subject.AFM, name: 'Derivatives', isCompleted: false, plannedDate: '2024-06-20', estimatedHours: 12 },
  { id: '7', subject: Subject.AFM, name: 'Portfolio Management', isCompleted: false, plannedDate: '2024-07-01', estimatedHours: 10 },

  // Audit
  { id: '8', subject: Subject.AUDIT, name: 'Professional Ethics', isCompleted: true, plannedDate: '2024-05-20', estimatedHours: 6 },
  { id: '9', subject: Subject.AUDIT, name: 'Company Audit', isCompleted: true, plannedDate: '2024-05-25', estimatedHours: 8 },
  { id: '10', subject: Subject.AUDIT, name: 'Audit Standards (SA 500-599)', isCompleted: false, plannedDate: '2024-06-30', estimatedHours: 14 },
  
  // DT
  { id: '11', subject: Subject.DT, name: 'Capital Gains', isCompleted: true, plannedDate: '2024-05-15', estimatedHours: 10 },
  { id: '12', subject: Subject.DT, name: 'PGBP', isCompleted: false, plannedDate: '2024-06-12', estimatedHours: 16 },
  { id: '13', subject: Subject.DT, name: 'International Taxation', isCompleted: false, plannedDate: '2024-07-10', estimatedHours: 20 },

  // IDT
  { id: '14', subject: Subject.IDT, name: 'GST Introduction', isCompleted: true, plannedDate: '2024-05-01', estimatedHours: 4 },
  { id: '15', subject: Subject.IDT, name: 'Input Tax Credit', isCompleted: true, plannedDate: '2024-05-10', estimatedHours: 8 },

  // IBS
  { id: '16', subject: Subject.IBS, name: 'Case Study 1', isCompleted: false, plannedDate: '2024-08-01', estimatedHours: 5 },
];

export const SPOM_SET_C_SUBJECTS = [
  'Risk Management',
  'Sustainable Development and Sustainability Reporting',
  'Public Finance and Government Accounting',
  'The Insolvency and Bankruptcy Code, 2016',
  'International Taxation',
  'The Arbitration and Conciliation Act, 1996',
  'Forensic Accounting',
  'Valuation',
  'Financial Services and Capital Markets',
  'Forex and Treasury Management'
];

export const SPOM_SET_D_SUBJECTS = [
  'The Constitution of India & Art of Advocacy',
  'Psychology & Philosophy',
  'Entrepreneurship & Start-up Ecosystem',
  'Digital Ecosystem and Controls'
];

export const INITIAL_SPOM_EXAMS: SPOMExam[] = [
    { id: 'spom-1', set: 'Set A', subject: 'Corporate & Economic Laws', marks: '', status: 'Pending' },
    { id: 'spom-2', set: 'Set B', subject: 'Strategic Cost & Performance Mgmt', marks: '', status: 'Pending' },
    { id: 'spom-3', set: 'Set C', subject: '', marks: '', status: 'Pending' },
    { id: 'spom-4', set: 'Set D', subject: '', marks: '', status: 'Pending' },
];

// Generate last 90 days logs for consistency chart
const today = new Date();
export const MOCK_LOGS: StudyLog[] = Array.from({ length: 90 }).map((_, i) => {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  
  // Randomly skip some days to make it realistic
  const skip = Math.random() > 0.8;
  if (skip) {
    return {
        id: `log-${i}`,
        date: date.toISOString().split('T')[0],
        subject: Subject.FR,
        hours: 0
    };
  }

  const subjects = Object.values(Subject);
  return {
    id: `log-${i}`,
    date: date.toISOString().split('T')[0],
    subject: subjects[Math.floor(Math.random() * subjects.length)],
    hours: Math.floor(Math.random() * 8) + 1 // 1 to 8 hours
  };
}).filter(log => log.hours > 0);

export const AUDIT_INTENSIVE_PLAN: AuditTask[] = [
  { day: 1, topic: 'SA 200 Series + Ethics Basics', completed: true },
  { day: 2, topic: 'SA 300 Series + Ethics Part 2', completed: true },
  { day: 3, topic: 'SA 400 Series + Company Audit I', completed: false },
  { day: 4, topic: 'SA 500 Series (Evidence)', completed: false },
  { day: 5, topic: 'SA 500 Series (Specifics)', completed: false },
  { day: 6, topic: 'SA 600 Series + CARO 2020', completed: false },
  { day: 7, topic: 'SA 700 Series (Reporting)', completed: false },
  { day: 8, topic: 'Bank Audit', completed: false },
  { day: 9, topic: 'Audit of NBFCs', completed: false },
  { day: 10, topic: 'Audit Committee & Corp Gov', completed: false },
  { day: 11, topic: 'Consolidated Fin Statements', completed: false },
  { day: 12, topic: 'Liabilities of Auditor', completed: false },
  { day: 13, topic: 'Internal Audit & Mgmt Audit', completed: false },
  { day: 14, topic: 'Due Diligence & Investigation', completed: false },
  { day: 15, topic: 'Peer Review & Quality Review', completed: false },
  { day: 16, topic: 'Tax Audit Basics', completed: false },
  { day: 17, topic: 'Tax Audit Clauses 1-20', completed: false },
  { day: 18, topic: 'Tax Audit Clauses 21-44', completed: false },
  { day: 19, topic: 'Forensic Audit', completed: false },
  { day: 20, topic: 'Full Syllabus Mock Test', completed: false },
];