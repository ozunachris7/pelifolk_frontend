export type Kind = 'expense' | 'income';
export type Tab = 'expenses' | 'incomes' | 'categories' | 'suppliers';
export interface Category {
  id: number;
  name: string;
}
export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  active: boolean;
}
export interface SupplierInput {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  active: boolean;
}
export interface Sale {
  id: string;
  animal_id: string;
  animal_name: string | null;
  siniiga: string | null;
  date: string;
}
export interface MoneyRecord {
  id: string;
  category: Category;
  amount: string;
  date: string;
  description: string | null;
  supplier: Supplier | null;
  sale: Sale | null;
}
export interface Page<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}
export interface Summary {
  income_total: string;
  expense_total: string;
  balance: string;
  income_count: number;
  expense_count: number;
}
export interface MoneyQuery {
  q: string;
  category_id: number;
  date_from: string;
  date_to: string;
  offset: number;
}
export interface MoneyInput {
  category_id: number;
  amount: string;
  date: string;
  description: string | null;
  supplier_id?: string | null;
  exit_event_id?: string | null;
}
export const categoryLabel = (name: string) =>
  (
    ({
      feed: 'Alimentación',
      veterinary: 'Sanidad',
      maintenance: 'Mantenimiento',
      transport: 'Transporte',
      other: 'Otros',
      animal_sales: 'Venta de animales',
    }) as Record<string, string>
  )[name] ?? name;
export const saleLabel = (sale: Sale) =>
  [sale.animal_name, sale.siniiga].filter(Boolean).join(' · ') || 'Sin identificación';
