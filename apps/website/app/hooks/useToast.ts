import { useNotification, type NotificationType } from "../components/NotificationContext";

export function useToast() {
  const { showNotification } = useNotification();

  const success = (op: { title: string; message?: string; duration?: number }) => {
    showNotification({ type: "success", ...op });
  };

  const error = (op: { title: string; message?: string; duration?: number }) => {
    showNotification({ type: "error", ...op });
  };

  const warning = (op: { title: string; message?: string; duration?: number }) => {
    showNotification({ type: "warning", ...op });
  };

  const info = (op: { title: string; message?: string; duration?: number }) => {
    showNotification({ type: "info", ...op });
  };

  const toast = (type: NotificationType, op: { title: string; message?: string; duration?: number }) => {
    showNotification({ type, ...op });
  };

  return {
    success,
    error,
    warning,
    info,
    toast,
  };
}
