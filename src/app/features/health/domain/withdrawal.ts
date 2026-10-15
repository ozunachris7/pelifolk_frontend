export type WithdrawalStatus = 'pending' | 'complete' | 'unknown' | 'no_records';
export interface Withdrawal {
  animal: { id: string; name: string | null; siniiga: string | null };
  as_of: string;
  status: WithdrawalStatus;
  release_date: string | null;
  treatment_count: number;
  unknown_count: number;
  in_treatment: boolean;
  items?: {
    event_id: string;
    product_name: string;
    start_date: string;
    last_day: string;
    withdrawal_days: number | null;
    release_date: string | null;
    status: WithdrawalStatus;
    in_treatment: boolean;
  }[];
}
export const withdrawalLabel = (status: WithdrawalStatus) =>
  ({
    pending: 'Retiro pendiente',
    complete: 'Sin retiro pendiente según registros',
    unknown: 'Periodo por verificar',
    no_records: 'Sin tratamientos registrados',
  })[status];
