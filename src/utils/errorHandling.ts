export const handleError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String(error.message));
  }
  
  return new Error('Une erreur inconnue est survenue');
};

export const logError = (error: unknown, context?: string) => {
  const formattedError = handleError(error);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]:`, {
      message: formattedError.message,
      stack: formattedError.stack,
      context
    });
  }
  
  return formattedError;
};