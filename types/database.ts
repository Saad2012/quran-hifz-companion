import type { PersistedAppData } from "./models";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_hifz_snapshots: {
        Row: {
          created_at: string;
          last_synced_at: string;
          payload: PersistedAppData;
          payload_version: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          last_synced_at?: string;
          payload: PersistedAppData;
          payload_version?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          last_synced_at?: string;
          payload?: PersistedAppData;
          payload_version?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "user_hifz_snapshots_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
