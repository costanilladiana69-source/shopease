// Firebase Error Handler Utility
// Provides consistent error handling and user-friendly messages

export const getFirebaseErrorMessage = (error) => {
  console.error('Firebase Error:', error);
  
  // Handle different types of Firebase errors
  if (error.code) {
    switch (error.code) {
      // Authentication errors
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      
      // Firestore errors
      case 'permission-denied':
        return 'You do not have permission to perform this action.';
      case 'unavailable':
        return 'Service is temporarily unavailable. Please try again.';
      case 'unauthenticated':
        return 'Please log in to continue.';
      case 'not-found':
        return 'The requested data was not found.';
      case 'already-exists':
        return 'This item already exists.';
      case 'failed-precondition':
        return 'Operation failed due to a precondition.';
      case 'aborted':
        return 'Operation was aborted. Please try again.';
      case 'out-of-range':
        return 'The operation is out of range.';
      case 'unimplemented':
        return 'This feature is not yet implemented.';
      case 'internal':
        return 'An internal error occurred. Please try again.';
      case 'data-loss':
        return 'Data loss occurred. Please refresh and try again.';
      
      // Storage errors
      case 'storage/object-not-found':
        return 'The requested file was not found.';
      case 'storage/bucket-not-found':
        return 'Storage bucket not found.';
      case 'storage/project-not-found':
        return 'Storage project not found.';
      case 'storage/quota-exceeded':
        return 'Storage quota exceeded.';
      case 'storage/unauthenticated':
        return 'Please log in to upload files.';
      case 'storage/unauthorized':
        return 'You do not have permission to upload files.';
      case 'storage/retry-limit-exceeded':
        return 'Upload failed after multiple attempts.';
      case 'storage/invalid-checksum':
        return 'File upload failed due to corruption.';
      case 'storage/canceled':
        return 'Upload was canceled.';
      case 'storage/invalid-event-name':
        return 'Invalid upload event.';
      case 'storage/invalid-url':
        return 'Invalid file URL.';
      case 'storage/invalid-argument':
        return 'Invalid upload arguments.';
      case 'storage/no-default-bucket':
        return 'No default storage bucket configured.';
      case 'storage/cannot-slice-blob':
        return 'Cannot slice file for upload.';
      case 'storage/server-file-wrong-size':
        return 'File size mismatch on server.';
      
      // Network errors
      case 'network-request-failed':
        return 'Network error. Please check your connection.';
      case 'timeout':
        return 'Request timed out. Please try again.';
      
      default:
        return `An error occurred: ${error.code}`;
    }
  }
  
  // Handle error messages
  if (error.message) {
    // Check for common error patterns
    if (error.message.includes('permission')) {
      return 'You do not have permission to perform this action.';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (error.message.includes('quota')) {
      return 'Storage quota exceeded. Please contact support.';
    }
    
    return error.message;
  }
  
  // Fallback message
  return 'An unexpected error occurred. Please try again.';
};

export const handleFirebaseError = (error, context = '') => {
  const message = getFirebaseErrorMessage(error);
  const fullMessage = context ? `${context}: ${message}` : message;
  
  console.error('Firebase Error Handler:', {
    error,
    context,
    message: fullMessage,
    timestamp: new Date().toISOString()
  });
  
  return fullMessage;
};

export const isRetryableError = (error) => {
  const retryableCodes = [
    'unavailable',
    'timeout',
    'network-request-failed',
    'aborted',
    'internal'
  ];
  
  return retryableCodes.includes(error.code);
};

export const getRetryDelay = (attemptNumber) => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attemptNumber), 16000);
};

export const retryFirebaseOperation = async (operation, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }
      
      const delay = getRetryDelay(attempt);
      console.log(`Retrying operation in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Specific error handlers for common operations
export const handleAuthError = (error) => {
  return handleFirebaseError(error, 'Authentication failed');
};

export const handleFirestoreError = (error, operation = 'Database operation') => {
  return handleFirebaseError(error, operation);
};

export const handleStorageError = (error, operation = 'File operation') => {
  return handleFirebaseError(error, operation);
};

// Error logging utility
export const logFirebaseError = (error, context = '', additionalData = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      code: error.code,
      message: error.message,
      stack: error.stack
    },
    additionalData,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
  };
  
  console.error('Firebase Error Log:', errorLog);
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or your own logging endpoint
  
  return errorLog;
};

// Validation helpers
export const validateFirebaseData = (data, requiredFields = []) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeFirebaseData = (data) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};


