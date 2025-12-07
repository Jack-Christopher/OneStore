export interface CreateClerkDTO {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  full_name?: string;
  is_active?: boolean;
}

