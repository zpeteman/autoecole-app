export interface Student {
  id: string;
  name: string;
  phone: string;
  national_id: string;
  student_id: string;
  address: string;
  payment_status: 'complete' | 'partial' | 'not_defined';
  date_of_registration: string;
  status: 'active' | 'inactive';
  total_fees?: number;
  image_url?: string;
  birthday?: string;
}

export interface Exam {
  id: string;
  student_id: string;
  exam_type: string;
  exam_date: string;
  result: string;
  notes?: string;
}

export interface Payment {
  id: string;
  student_id: string;
  amount: string;
  payment_date: string;
  payment_type: string;
  notes?: string;
} 