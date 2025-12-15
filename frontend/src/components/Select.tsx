import { useState, useRef, useEffect } from 'react';

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
  searchThreshold?: number; // Threshold for enabling search mode
}

export default function Select({ options = [], setFormInput, styles, value, disabled, searchThreshold = 20 }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shouldUseSearch = (options?.length || 0) >= searchThreshold;

  // Filter options based on search term
  useEffect(() => {
    if (shouldUseSearch && searchTerm) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else if (shouldUseSearch) {
      setFilteredOptions([]);
    }
  }, [searchTerm, options, shouldUseSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && shouldUseSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, shouldUseSearch]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormInput(event.target.value);
  };

  const handleSelectChange = (selectedValue: string) => {
    setFormInput(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const selectedOption = options?.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : 'Seleccione una opción';

  const defaultStyles = "border border-border rounded p-2 w-full mb-3 bg-card text-foreground dark:text-foreground";
  const combinedStyles = styles ? `${defaultStyles} ${styles}` : defaultStyles;

  // Use native select for small lists (backward compatible)
  if (!shouldUseSearch) {
    return (
      <select
        className={combinedStyles}
        onChange={handleChange}
        value={value || ''}
        disabled={disabled}
      >
        <option value="" className="bg-white text-black dark:bg-black dark:text-white">Seleccione una opción</option>
        {options?.map((o) => {
          return <option key={o.value} value={o.value} className="bg-white text-black dark:bg-black dark:text-white">{o.label}</option>
        })}
      </select>
    );
  }

  // Use searchable dropdown for large lists
  return (
    <div ref={containerRef} className="relative w-full mb-3">
      <div
        className={`${combinedStyles} cursor-pointer flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleToggle}
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {displayValue}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              placeholder="Escriba para buscar..."
              className="w-full p-2 border border-border rounded bg-card text-foreground placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {searchTerm === '' ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Escriba para buscar opciones...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground ${value === option.value ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  onClick={() => handleSelectChange(option.value)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}