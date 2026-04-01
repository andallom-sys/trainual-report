export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      managers: {
        Row: {
          id: string;
          manager_name: string;
          manager_email: string | null;
          department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          manager_name: string;
          manager_email?: string | null;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          manager_name?: string;
          manager_email?: string | null;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          employee_name: string;
          employee_email: string | null;
          employee_external_id: string | null;
          department: string | null;
          manager_id: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_name: string;
          employee_email?: string | null;
          employee_external_id?: string | null;
          department?: string | null;
          manager_id?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_name?: string;
          employee_email?: string | null;
          employee_external_id?: string | null;
          department?: string | null;
          manager_id?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      trainual_completions: {
        Row: {
          id: string;
          employee_id: string;
          completion_percentage: number;
          total_modules: number | null;
          completed_modules: number | null;
          remaining_modules: number | null;
          snapshot_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          completion_percentage: number;
          total_modules?: number | null;
          completed_modules?: number | null;
          remaining_modules?: number | null;
          snapshot_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          completion_percentage?: number;
          total_modules?: number | null;
          completed_modules?: number | null;
          remaining_modules?: number | null;
          snapshot_date?: string | null;
          created_at?: string;
        };
      };
      imports: {
        Row: {
          id: string;
          source_name: string;
          import_type: string;
          imported_at: string;
          row_count: number;
          status: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          source_name: string;
          import_type: string;
          imported_at?: string;
          row_count?: number;
          status: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          source_name?: string;
          import_type?: string;
          imported_at?: string;
          row_count?: number;
          status?: string;
          notes?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          role: "admin" | "viewer";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "admin" | "viewer";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "viewer";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
