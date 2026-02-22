import { ApiError } from '../../api/http-client';

function codeFromUnknownError(error: unknown): string | null {
  if (error instanceof ApiError) {
    return error.code;
  }

  if (typeof error === 'object' && error !== null && 'code' in error) {
    const value = (error as { code?: unknown }).code;
    if (typeof value === 'string') {
      return value;
    }
  }

  return null;
}

export function getAuthErrorMessage(error: unknown): string {
  const code = codeFromUnknownError(error);

  switch (code) {
    case 'USERNAME_EXISTS':
      return 'Ese apodo ya esta en uso.';
    case 'EMAIL_EXISTS':
      return 'Ese correo ya esta registrado.';
    case 'INVALID_CREDENTIALS':
      return 'Credenciales invalidas.';
    case 'EMAIL_NOT_VERIFIED':
      return 'Debes verificar tu correo antes de iniciar sesion.';
    case 'TOKEN_EXPIRED':
      return 'El token de verificacion ha caducado.';
    case 'TOKEN_ALREADY_USED':
      return 'Este token de verificacion ya fue usado.';
    case 'INVALID_TOKEN':
      return 'Token invalido.';
    case 'RESET_TOKEN_INVALID':
      return 'El token para restablecer contrasena no es valido.';
    case 'RESET_TOKEN_EXPIRED':
      return 'El token para restablecer contrasena ha caducado.';
    case 'CURRENT_PASSWORD_INCORRECT':
      return 'La contrasena actual no es correcta.';
    case 'MAIL_SEND_FAILED':
      return 'No se pudo enviar el correo en este momento.';
    case 'VALIDATION_ERROR':
      return 'Completa todos los campos obligatorios.';
    case 'ONLY_ALEXIS_CAN_PUBLISH':
      return 'Solo Alexis puede publicar relatos.';
    case 'STORY_NOT_FOUND':
      return 'El relato no existe.';
    case 'HTTP_401':
      return 'Tu sesion no es valida. Inicia sesion de nuevo.';
    case 'HTTP_403':
      return 'No tienes permisos para realizar esta accion.';
    case 'NETWORK_ERROR':
      return 'No se pudo conectar con el backend.';
    default:
      break;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Ocurrio un error. Intentalo de nuevo.';
}
