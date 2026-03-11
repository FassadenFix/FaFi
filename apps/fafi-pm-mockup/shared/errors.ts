/**
 * Custom Error Classes mit Error Codes für tRPC
 * Einheitliche Fehlerbehandlung im gesamten System
 */

export enum ErrorCode {
  // Auth Errors (1xxx)
  UNAUTHORIZED = 1001,
  FORBIDDEN = 1002,
  SESSION_EXPIRED = 1003,
  INVALID_TOKEN = 1004,

  // Validation Errors (2xxx)
  VALIDATION_FAILED = 2001,
  MISSING_REQUIRED_FIELD = 2002,
  INVALID_FORMAT = 2003,
  DUPLICATE_ENTRY = 2004,

  // Business Logic Errors (3xxx)
  PHASE_TRANSITION_BLOCKED = 3001,
  PREREQUISITE_NOT_MET = 3002,
  RESOURCE_CONFLICT = 3003,
  BUDGET_EXCEEDED = 3004,
  DEADLINE_PASSED = 3005,

  // External Service Errors (4xxx)
  HUBSPOT_SYNC_FAILED = 4001,
  MS365_AUTH_FAILED = 4002,
  EMAIL_SEND_FAILED = 4003,
  S3_UPLOAD_FAILED = 4004,
  WEATHER_API_FAILED = 4005,

  // Data Errors (5xxx)
  NOT_FOUND = 5001,
  ALREADY_EXISTS = 5002,
  STALE_DATA = 5003,
  DATA_INTEGRITY = 5004,
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: "Nicht autorisiert. Bitte erneut anmelden.",
  [ErrorCode.FORBIDDEN]: "Keine Berechtigung für diese Aktion.",
  [ErrorCode.SESSION_EXPIRED]: "Sitzung abgelaufen. Bitte erneut anmelden.",
  [ErrorCode.INVALID_TOKEN]: "Ungültiger Token.",
  [ErrorCode.VALIDATION_FAILED]: "Validierung fehlgeschlagen.",
  [ErrorCode.MISSING_REQUIRED_FIELD]: "Pflichtfeld fehlt.",
  [ErrorCode.INVALID_FORMAT]: "Ungültiges Format.",
  [ErrorCode.DUPLICATE_ENTRY]: "Eintrag existiert bereits.",
  [ErrorCode.PHASE_TRANSITION_BLOCKED]: "Phasenübergang nicht möglich.",
  [ErrorCode.PREREQUISITE_NOT_MET]: "Voraussetzung nicht erfüllt.",
  [ErrorCode.RESOURCE_CONFLICT]: "Ressourcenkonflikt.",
  [ErrorCode.BUDGET_EXCEEDED]: "Budget überschritten.",
  [ErrorCode.DEADLINE_PASSED]: "Frist überschritten.",
  [ErrorCode.HUBSPOT_SYNC_FAILED]: "HubSpot-Synchronisation fehlgeschlagen.",
  [ErrorCode.MS365_AUTH_FAILED]: "Microsoft 365 Authentifizierung fehlgeschlagen.",
  [ErrorCode.EMAIL_SEND_FAILED]: "E-Mail-Versand fehlgeschlagen.",
  [ErrorCode.S3_UPLOAD_FAILED]: "Datei-Upload fehlgeschlagen.",
  [ErrorCode.WEATHER_API_FAILED]: "Wetterdaten konnten nicht abgerufen werden.",
  [ErrorCode.NOT_FOUND]: "Datensatz nicht gefunden.",
  [ErrorCode.ALREADY_EXISTS]: "Datensatz existiert bereits.",
  [ErrorCode.STALE_DATA]: "Daten veraltet. Bitte aktualisieren.",
  [ErrorCode.DATA_INTEGRITY]: "Datenintegritätsfehler.",
};

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message?: string, details?: Record<string, unknown>) {
    super(message || ERROR_MESSAGES[code]);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Helper: Convert AppError to tRPC error format
 */
export function toTRPCErrorCode(code: ErrorCode): "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INTERNAL_SERVER_ERROR" {
  if (code >= 1001 && code <= 1002) return "UNAUTHORIZED";
  if (code === 1002) return "FORBIDDEN";
  if (code >= 2001 && code <= 2004) return "BAD_REQUEST";
  if (code === 3003 || code === 5002) return "CONFLICT";
  if (code === 5001) return "NOT_FOUND";
  return "INTERNAL_SERVER_ERROR";
}
