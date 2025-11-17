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
      alertStyle = "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative";
      break;
    case "success":
      alertStyle = "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative";
      break;
    case "info":
      alertStyle = "bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative";
      break;
    default:
      alertStyle = "bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative";
  }

  return (
    <div className={alertStyle + (styles ? ` ${styles}` : "")} role="alert">
      <strong className="font-bold">{boldMessage}</strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );

}