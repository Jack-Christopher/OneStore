// Auth-specific error codes
module.exports.AuthErrorCode = {
  EMAIL_NOT_FOUND: {
    message: "Correo eléctronico no vinculado a ninguna cuenta. Por favor, regístrate primero.",
    name: "EMAIL_NOT_FOUND" 
  },
  INVALID_PASSWORD: {
    message: "Contraseña inválida. Por favor, inténtalo de nuevo.",
    name: "INVALID_PASSWORD"
  },
  EMAIL_ALREADY_EXISTS: {
    message: "El correo electrónico ya ha sido registrado. Por favor, utiliza un correo diferente.",
    name: "EMAIL_ALREADY_EXISTS"
  },
  UNAUTHORIZED: {
    message: "Acceso no autorizado",
    name: "UNAUTHORIZED"
  },
  TOKEN_INVALID: {
    message: "Token inválido",
    name: "TOKEN_INVALID"
  },
  BAD_INPUT: {
    message: "Entrada incorrecta",
    name: "BAD_INPUT"
  }
}
