interface AlertProps {
  type: string;
  boldMessage?: string;
  message: string;
  styles?: string;
  icon?: React.ReactNode;
}

export default function Alert({ type, boldMessage, message, styles, icon }: AlertProps) {
  let alertStyle = "";
  let iconElement = icon;

  switch (type) {
    case "error":
      alertStyle = "bg-red-50 border-l-4 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-600 dark:text-red-200 px-4 py-3 rounded shadow-sm";
      if (!iconElement) {
        iconElement = (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      }
      break;
    case "success":
      alertStyle = "bg-green-50 border-l-4 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-600 dark:text-green-200 px-4 py-3 rounded shadow-sm";
      if (!iconElement) {
        iconElement = (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      }
      break;
    case "info":
      alertStyle = "bg-blue-50 border-l-4 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-200 px-4 py-3 rounded shadow-sm";
      if (!iconElement) {
        iconElement = (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      }
      break;
    case "warning":
      alertStyle = "bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-200 px-4 py-3 rounded shadow-sm";
      if (!iconElement) {
        iconElement = (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      }
      break;
    default:
      alertStyle = "bg-primary border-l-4 border-secondary text-text-main px-4 py-3 rounded shadow-sm";
  }

  return (
    <div className={`${alertStyle} ${styles || ""} flex items-start gap-3`} role="alert">
      {iconElement && (
        <div className="flex-shrink-0 mt-0.5">
          {iconElement}
        </div>
      )}
      <div className="flex-1">
        {boldMessage && <strong className="font-semibold block mb-1">{boldMessage}</strong>}
        <span className="block">{message}</span>
      </div>
    </div>
  );
}