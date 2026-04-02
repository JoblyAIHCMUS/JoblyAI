import { toast as sonnerToast } from 'sonner';

interface ToastMethods {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const useToast = (): { toast: ToastMethods } => {
  const toast: ToastMethods = {
    success: (message: string) => sonnerToast.success(message),
    error: (message: string) => sonnerToast.error(message),
    info: (message: string) => sonnerToast.info(message),
  };

  return { toast };
};
