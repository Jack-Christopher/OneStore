interface InputProps {
  type: "text" | "number" | "email" | "password" | "date" | "time" | "datetime-local" | "tel" | "url" | "search" | "file" | "checkbox" | "radio" | "select" | "textarea";
  placeholder: string;
  value: string | number | boolean | undefined;
  min?: number;
  max?: number;
  step?: number | "any";
  readOnly?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const defaultOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  if (e.target.value === "0") {
    e.target.value = "";
  }
}

const defaultOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  if (e.target.value === "") {
    e.target.value = "0";
  }
}

export default function Input({ type = "text", placeholder, value, min = 0, max, step = 1, readOnly = false, onFocus = defaultOnFocus, onBlur = defaultOnBlur, onChange }: InputProps) {
  switch (type) {
    // Most common types
    case "number":
      return <input type="number" min={min} max={max} step={step} readOnly={readOnly} onFocus={onFocus} onBlur={onBlur} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "text":
      return <input type="text" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "email":
      return <input type="email" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "password":
      return <input type="password" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "date":

    // TODO: add special handling for date input
      return <input type="date" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "time":
      return <input type="time" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "datetime-local":
      return <input type="datetime-local" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "tel":
      return <input type="tel" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "url":
      return <input type="url" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "search":
      return <input type="search" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "file":
      return <input type="file" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "checkbox":
      return <input type="checkbox" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "radio":
      return <input type="radio" readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
    case "select":
      // TODO: add special handling for select input
    default:
      return <input type={type} readOnly={readOnly} placeholder={placeholder} className="border rounded p-2 w-full mb-3" value={value as string} onChange={onChange} />
  }
}

