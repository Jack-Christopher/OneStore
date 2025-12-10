import { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getDateFormat } from "@/utils/date";

dayjs.extend(customParseFormat);

interface DateInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

/**
 * DateInput component with visual calendar picker that formats dates according to user's preferred format from settings
 * Internally converts to/from YYYY-MM-DD for API compatibility
 */
export default function DateInput({
  value,
  onChange,
  placeholder,
  readOnly = false,
  className = "border rounded p-2 w-full mb-3",
  min,
  max
}: DateInputProps) {
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);
  const dateFormat = getDateFormat();

  // Convert YYYY-MM-DD string to Dayjs object
  useEffect(() => {
    if (value) {
      // Parse the value (should be in YYYY-MM-DD format from API)
      const parsed = dayjs(value, "YYYY-MM-DD");
      setDateValue(parsed.isValid() ? parsed : null);
    } else {
      setDateValue(null);
    }
  }, [value]);

  const handleDateChange = (newValue: Dayjs | null) => {
    setDateValue(newValue);

    if (newValue && newValue.isValid()) {
      // Convert to YYYY-MM-DD format for API compatibility
      const formattedValue = newValue.format("YYYY-MM-DD");

      // Create a synthetic event with the converted value
      const syntheticEvent = {
        target: {
          value: formattedValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    } else {
      // Empty value
      const syntheticEvent = {
        target: {
          value: "",
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    }
  };

  // Convert min/max from YYYY-MM-DD to Dayjs
  const minDate = min ? dayjs(min, "YYYY-MM-DD") : undefined;
  const maxDate = max ? dayjs(max, "YYYY-MM-DD") : undefined;

  // Map format strings to dayjs format
  const getDayjsFormat = (format: string): string => {
    const formatMap: Record<string, string> = {
      "DD/MM/YYYY": "DD/MM/YYYY",
      "MM/DD/YYYY": "MM/DD/YYYY",
      "YYYY-MM-DD": "YYYY-MM-DD",
      "DD-MM-YYYY": "DD-MM-YYYY",
    };
    return formatMap[format] || "DD/MM/YYYY";
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <DatePicker
        label={placeholder || "Fecha"}
        value={dateValue}
        onChange={handleDateChange}
        format={getDayjsFormat(dateFormat)}
        disabled={readOnly}
        minDate={minDate}
        maxDate={maxDate}
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
            className: className.replace("mb-3", ""),
            sx: {
              marginBottom: "12px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px",
              }
            }
          },
        }}
      />
    </LocalizationProvider>
  );
}

