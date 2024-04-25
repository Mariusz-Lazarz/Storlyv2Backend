export interface PgError extends Error {
  code: string;
  detail: string;
  table: string;
  constraint: string;
}
