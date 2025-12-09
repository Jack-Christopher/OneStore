import { useState } from "react";
import { Box, Button, Modal } from "@mui/material";
import { setBaseCurrency } from "@/services/api/settings";
import Select, { type SelectOption } from "@/components/Select";
import Alert from "@/components/Alert";

interface BaseCurrencyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CURRENCY_OPTIONS: SelectOption[] = [
  { value: "PEN", label: "PEN (Peruvian Sol)" },
  { value: "USD", label: "USD (US Dollar)" },
  { value: "EUR", label: "EUR (Euro)" },
];

export default function BaseCurrencyModal({ open, onClose, onSuccess }: BaseCurrencyModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const boxStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!selectedCurrency) {
      setError("Please select a base currency");
      setLoading(false);
      return;
    }

    try {
      await setBaseCurrency(selectedCurrency);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error setting base currency:", error);
      setError(error?.response?.data?.message || "Error setting base currency");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => {}} className="flex items-center justify-center">
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Select Base Currency</h2>
        <p className="text-center mb-4 text-gray-600">
          Select your base currency. This cannot be changed later.
        </p>

        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">Base Currency *</label>
          <Select
            options={CURRENCY_OPTIONS}
            setFormInput={(value) => setSelectedCurrency(value)}
            styles="border rounded p-2 w-full mb-3"
            value={selectedCurrency}
          />

          {error && (
            <Alert
              type="error"
              boldMessage="Error: "
              message={error}
              styles="mb-4"
            />
          )}

          <div className="flex justify-center mt-4">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading || !selectedCurrency}
            >
              Save Base Currency
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}

