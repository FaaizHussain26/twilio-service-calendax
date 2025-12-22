export interface PatientFollowupStatusCreateRequest {
  patient_id: number;
  patient_contactno: string;
  agent_id: string;
  conversation_id: string;
  call_status: boolean;
  shift: "Morning" | "Afternoon" | "Evening" | "Night";
  transcript: string;
  summary: string;
  summary_title: string;
  time_utc: Date;
  call_dusation_secs?: number;
  system_prompt: string;
  followup_type:
    | "initial"
    | "reminder"
    | "reschedule"
    | "confirmation"
    | "followup";
  followup_status:
    | "scheduled"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "no_answer"
    | "busy"
    | "failed";
  next_followup_date?: Date;
  notes?: string;
  appointment_id?: string;
  lead_id?: string;
  study_id?: string;
}

export interface PatientFollowupStatusUpdateRequest {
  call_status?: boolean;
  followup_status?:
    | "scheduled"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "no_answer"
    | "busy"
    | "failed";
  next_followup_date?: Date;
  notes?: string;
  call_dusation_secs?: number;
  transcript?: string;
  summary?: string;
  summary_title?: string;
}

export interface PatientFollowupStatusResponse {
  _id: string;
  followup_id: string;
  patient_id: number;
  patient_contactno: string;
  agent_id: string;
  conversation_id: string;
  call_status: boolean;
  shift: string;
  transcript: string;
  summary: string;
  summary_title: string;
  time_utc: Date;
  call_dusation_secs?: number;
  system_prompt: string;
  followup_type: string;
  followup_status: string;
  next_followup_date?: Date;
  notes?: string;
  appointment_id?: string;
  lead_id?: string;
  study_id?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientFollowupStatusQuery {
  patient_id?: number;
  patient_contactno?: string;
  followup_status?: string;
  followup_type?: string;
  shift?: string;
  dateFrom?: Date;
  dateTo?: Date;
  agent_id?: string;
  conversation_id?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PatientFollowupStatusStats {
  totalFollowups: number;
  completedFollowups: number;
  pendingFollowups: number;
  cancelledFollowups: number;
  failedFollowups: number;
  averageCallDuration: number;
  followupsByType: Record<string, number>;
  followupsByStatus: Record<string, number>;
  followupsByShift: Record<string, number>;
}
