export type ID = string | number;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
