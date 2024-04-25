export interface PgError extends Error {
  code: string;
  detail: string;
  table: string;
  constraint: string;
}

export interface UserCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserType {
  id: string;
  email: string;
  password: string | undefined;
  name: string;
}
