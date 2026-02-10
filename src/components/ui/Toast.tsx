// src/components/ui/Toast.tsx
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  dismissible?: boolean;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: { id: string } }
  | { type: 'CLEAR_TOASTS' };

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      // Check for duplicate messages
      const isDuplicate = state.toasts.some(toast => toast.message === action.payload.message && toast.type === action.payload.type);
      if (isDuplicate) {
        return state;
      }
      
      return {
        ...state,
        toasts: [...state.toasts, { ...action.payload, id: Date.now().toString() }]
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload.id)
      };
    case 'CLEAR_TOASTS':
      return {
        ...state,
        toasts: []
      };
    default:
      return state;
  }
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const addToast = (toast: Omit<Toast, 'id'>) => {
    dispatch({ type: 'ADD_TOAST', payload: toast });
  };

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: { id } });
  };

  const clearToasts = () => {
    dispatch({ type: 'CLEAR_TOASTS' });
  };

  // Auto-remove toasts after their duration
  useEffect(() => {
    const timers: Record<string, NodeJS.Timeout> = {};

    state.toasts.forEach(toast => {
      const duration = toast.duration ?? 5000; // Default to 5 seconds
      if (duration > 0) {
        timers[toast.id] = setTimeout(() => {
          removeToast(toast.id);
        }, duration);
      }
    });

    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [state.toasts]);

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // Position toasts at the top-right corner
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  // Determine icon and color based on toast type
  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
        };
      case 'error':
        return {
          icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
        };
      case 'warning':
        return {
          icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />,
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
        };
      case 'info':
        return {
          icon: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
        };
      default:
        return {
          icon: <InformationCircleIcon className="w-5 h-5 text-gray-500" />,
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
        };
    }
  };

  const style = getToastStyle();

  return (
    <div 
      className={`${style.bg} ${style.border} border rounded-lg shadow-lg p-4 flex items-start w-full max-w-sm animate-fade-in`}
      role="alert"
      aria-live="assertive"
    >
      <div className="mr-3 mt-0.5">
        {style.icon}
      </div>
      <div className={`flex-1 text-sm ${style.text}`}>
        {toast.message}
      </div>
      {toast.dismissible !== false && (
        <button
          onClick={onRemove}
          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
          aria-label="Dismiss toast"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Helper functions for different toast types
export const useToastHelpers = () => {
  const { addToast } = useToast();

  const success = (message: string, duration?: number) => {
    addToast({ message, type: 'success', duration });
  };

  const error = (message: string, duration?: number) => {
    addToast({ message, type: 'error', duration });
  };

  const warning = (message: string, duration?: number) => {
    addToast({ message, type: 'warning', duration });
  };

  const info = (message: string, duration?: number) => {
    addToast({ message, type: 'info', duration });
  };

  return { success, error, warning, info };
};

// Animation styles
const toastStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = toastStyles;
  document.head.appendChild(styleSheet);
}