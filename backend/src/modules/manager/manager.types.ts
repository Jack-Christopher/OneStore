export interface CreateClerkDTO {
  email: string;
  password: string;
  full_name?: string;
}

export interface UpdateUserDTO {
  email?: string;
  full_name?: string;
  is_active?: boolean;
}

