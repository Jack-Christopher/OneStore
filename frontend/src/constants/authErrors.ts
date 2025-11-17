// // Auth-specific error codes

export const AuthErrorMessages: Record<string, string> = {
  EMAIL_NOT_FOUND: "Correo electrónico no vinculado a ninguna cuenta. Por favor, regístrate primero.",
  INVALID_PASSWORD: "Contraseña inválida. Por favor, inténtalo de nuevo.",
  EMAIL_ALREADY_EXISTS: "El correo electrónico ya ha sido registrado. Por favor, utiliza un correo diferente.",
  UNAUTHORIZED: "Acceso no autorizado",
  TOKEN_INVALID: "Token inválido",
  BAD_INPUT: "Entrada incorrecta"
}
