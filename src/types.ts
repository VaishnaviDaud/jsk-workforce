export interface Worker {
  id: string;
  name: string;
  phone: string;
  dailyWage: number;
  uid: string;
}

export interface Attendance {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
  uid: string;
}

export interface Advance {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  uid: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
