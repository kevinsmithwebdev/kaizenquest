export const formatApiErrorMessage = (
  message: unknown,
  fallback: string,
): string => {
  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return fallback;
};
