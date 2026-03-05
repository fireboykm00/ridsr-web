export function getAuthErrorMessage(
  error?: string | null,
  code?: string | null,
): string {
  if (error === "CredentialsSignin") {
    switch (code) {
      case "invalid_credentials":
      case "credentials":
        return "Invalid email/worker ID or password.";
      case "account_disabled":
        return "Your account has been deactivated. Please contact support.";
      case "auth_service_error":
        return "Authentication service is unavailable. Please try again.";
      default:
        return "Authentication failed. Please try again.";
    }
  }

  if (error === "AccessDenied") {
    return "Access denied. Please contact your administrator.";
  }

  if (error === "Configuration") {
    return "Authentication service is temporarily unavailable. Please try again.";
  }

  return "Authentication failed. Please try again.";
}
