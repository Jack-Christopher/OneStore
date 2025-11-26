export interface SelectOption {
  value: string,
  label: string
}

interface SelectProps {
  options: SelectOption[];
  setFormInput: (value: any) => void;
  styles?: string;
}


export default function Select({ options, setFormInput, styles }: SelectProps) {

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormInput(event.target.value); 
  };

  return (
    <select className={styles} onChange={handleChange}>
      <option value="">Seleccione una opción</option>
      {options && options.map((o) => {
        return <option key={o.value} value={o.value} >{o.label}</option>
      })}
    </select>
  );
}