export interface SelectOption {
  value: string,
  label: string,
}

interface SelectProps {
  options: SelectOption[];
  setFormInput: (value: any) => void;
  styles?: string;
  value?: string;
  disabled?: boolean;
}


export default function Select({ options, setFormInput, styles, value, disabled }: SelectProps) {

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormInput(event.target.value);
  };

  const defaultStyles = "border border-border rounded p-2 w-full mb-3 bg-card text-foreground dark:text-foreground";
  const combinedStyles = styles ? `${defaultStyles} ${styles}` : defaultStyles;

  return (
    <select 
      className={combinedStyles} 
      onChange={handleChange} 
      value={value} 
      disabled={disabled}
    >
      <option value="" className="bg-white text-black dark:bg-black dark:text-white">Seleccione una opción</option>
      {options && options.map((o) => {
        return <option key={o.value} value={o.value} className="bg-white text-black dark:bg-black dark:text-white">{o.label}</option>
      })}
    </select>
  );
}