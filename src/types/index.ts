// src/types/index.ts

// Base KaizenReport interface for existing files
export interface KaizenReport {
  id: number;
  theme: string;
  dept: string;
  file_name: string;
  drive_file_id: string;
  upload_date: string;
}

export interface SearchFilters {
  theme?: string;
  dept?: string;
  upload_date?: string;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Detailed KaizenReport for the form
export interface KaizenFormData {
  id?: number;
  circleNo: string;
  name: string;
  dept: string;
  eqpNo: string;
  eqpName: string;
  cellNo: string;
  cellName: string;
  kaizenTheme: string;
  problem: string;
  countermeasure: string;
  benchMark: string;
  target: string;
  kaizenStart: string;
  kaizenFinish: string;
  note: string;
  teamMembers: string;
  benefits: {
    p: string;
    q: string;
    c: string;
    d: string;
    s: string;
    m: string;
  };
  whyWhyAnalysis: {
    w1: string;
    w2: string;
    w3: string;
    w4: string;
  };
  rootCause: string;
  beforeImage?: File;
  afterImage?: File;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  results: string;
  kaizenSustenance: {
    whatToDo: string;
    howToDo: string;
    frequency: string;
  };
  costs: {
    materialCost: number;
    labourCost: number;
    totalCost: number;
  };
  horizontalDeployment: Array<{
    equipment: string;
    responsibility: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    targetDate: string;
  }>;
  registration: {
    regNo: string;
    date: string;
    registeredBy: string;
    managerSign: string;
  };
  upload_date?: string;
}