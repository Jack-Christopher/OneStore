interface AlertProps {
  type: string;
  boldMessage: string;
  message: string;
  styles?: string;
}

export default function Alert({ type, boldMessage, message, styles }: AlertProps) {
  let alertStyle = "";
  switch (type) {
    case "error":
      alertStyle = "bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200 px-4 py-3 rounded relative";
      break;
    case "success":
      alertStyle = "bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/50 dark:border-green-800 dark:text-green-200 px-4 py-3 rounded relative";
      break;
    case "info":
      alertStyle = "bg-blue-100 border border-blue-400 text-blue-700 dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-200 px-4 py-3 rounded relative";
      break;
    default:
      alertStyle = "bg-primary border border-secondary text-text-main px-4 py-3 rounded relative";
  }

  return (
    <div className={alertStyle + (styles ? ` ${styles}` : "")} role="alert">
      <strong className="font-bold">{boldMessage}</strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );

}