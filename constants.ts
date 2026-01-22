import { Subject, Chapter, StudyLog, AuditTask, SPOMExam } from './types';

// Mock data cleared for production release
export const MOCK_CHAPTERS: Chapter[] = [];

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

export const INITIAL_SPOM_EXAMS: SPOMExam[] = [];

export const MOCK_LOGS: StudyLog[] = [];

export const AUDIT_INTENSIVE_PLAN: AuditTask[] = [];
