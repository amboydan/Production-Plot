export interface FieldDataTable {
  message: string[];
  basic_stats: BasicStat[][] | string[];
}

export interface BasicStat {
  Stream: string;
  Start: string;        // "Nov 02, 2025"
  Stop: string;         // "Nov 24, 2025"
  Date_Diff: string;    // "22"
  Total_Days: number;
  Start_Value: string;  // "69,263"
  Stop_Value: string;   // "66,315"
  Sum: string;          // "1,531,324"
  Average: string;      // "66,579"
}
