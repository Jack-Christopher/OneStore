export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  fullname: string;
  email: string;
  password: string;
}

export interface UserDTO {
  name: string;
  email: string;
  password: string;
}

export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
}

export interface AuthTokenPayloadDTO {
  id: string;
  email: string;
}
