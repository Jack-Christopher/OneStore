import { useEffect, useState } from "react";
import { usePurchaseOrdersStore } from "@/store/purchaseOrdersStore";
import { useSuppliersStore } from "@/store/suppliersStore";
import { useWarehousesStore } from "@/store/warehousesStore";
import { useProductsStore } from "@/store/productsStore";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Modal, Checkbox, FormControlLabel } from "@mui/material";
import Alert from "@/components/Alert";
import Select, { type SelectOption } from "@/components/Select";
import Input from "@/components/Input";
import { v4 as uuidv4 } from 'uuid';
import type { CreatePurchaseOrderWithItemsPayload } from "@/services/api/purchaseOrders";
import { getBaseCurrency, getCurrencyRates } from "@/services/api/settings";

interface PurchaseOrdersCreateModalProps {
  open: boolean;
  onClose: () => void;
}

interface OrderItemState {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number; // Precio unitario en moneda base
  subtotal: number; // Subtotal en moneda base
  unitPriceOriginal?: number; // Precio unitario en moneda alternativa
  subtotalOriginal?: number; // Subtotal en moneda alternativa
}

export default function PurchaseOrdersCreateModal({ open, onClose }: PurchaseOrdersCreateModalProps) {
  const addWithItems = usePurchaseOrdersStore((s) => s.addWithItems);
  const { items: suppliers, fetch: fetchSuppliers } = useSuppliersStore();
  const { items: warehouses, fetch: fetchWarehouses } = useWarehousesStore();
  const { items: products, fetch: fetchProducts } = useProductsStore();

  const tenantId = useAuthStore.getState().authUser?.user?.tenantId || "orphan";
  const userId = useAuthStore.getState().authUser?.user?.id || "ghost";

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
    maxHeight: '80vh',
    overflowY: 'auto',
  };

  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItemState[]>([]);
  const [useForeignCurrency, setUseForeignCurrency] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [baseCurrency, setBaseCurrency] = useState<string | null>(null);
  const [currencyRates, setCurrencyRates] = useState<Record<string, number>>({});
  const [availableCurrencies, setAvailableCurrencies] = useState<SelectOption[]>([]);

  const [supplierOptions, setSupplierOptions] = useState<SelectOption[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOption[]>([]);
  const [productOptions, setProductOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const initialize = async () => {
      await fetchSuppliers();
      setSupplierOptions(suppliers.map(s => ({ value: s._id, label: s.name })));

      await fetchWarehouses();
      setWarehouseOptions(warehouses.map(w => ({ value: w._id, label: w.name })));

      await fetchProducts();
      setProductOptions(products.map(p => ({ value: p._id, label: p.name })));

      // Get base currency
      try {
        const res = await getBaseCurrency();
        if (res.success) {
          const currentBaseCurrency = res.data?.baseCurrency;
          setBaseCurrency(currentBaseCurrency || null);

          if (currentBaseCurrency) {
            // Fetch currency rates only if base currency is set
            try {
              const ratesRes = await getCurrencyRates(false);
              if (ratesRes.success && ratesRes.data?.rates) {
                setCurrencyRates(ratesRes.data.rates);

                // Build available currencies list
                const currencies: SelectOption[] = [];
                Object.keys(ratesRes.data.rates).forEach(key => {
                  const upperKey = key.toUpperCase();
                  if (upperKey !== currentBaseCurrency) {
                    currencies.push({ value: upperKey, label: upperKey });
                  }
                });
                setAvailableCurrencies(currencies);
              }
            } catch (ratesError) {
              console.error("Error fetching currency rates:", ratesError);
            }
          } else {
            // If base currency is not set, show all available currencies
            setAvailableCurrencies([
              { value: "USD", label: "USD" },
              { value: "EUR", label: "EUR" },
              { value: "PEN", label: "PEN" },
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching base currency:", error);
        // Show available currencies even if there's an error
        setAvailableCurrencies([
          { value: "USD", label: "USD" },
          { value: "EUR", label: "EUR" },
          { value: "PEN", label: "PEN" },
        ]);
      }
    };

    if (open) {
      initialize();
    }
  }, [open]);

  useEffect(() => {
    setSupplierOptions(suppliers.map(s => ({ value: s._id, label: s.name })));
  }, [suppliers]);

  useEffect(() => {
    setWarehouseOptions(warehouses.map(w => ({ value: w._id, label: w.name })));
  }, [warehouses]);

  useEffect(() => {
    setProductOptions(products.map(p => ({ value: p._id, label: p.name })));
  }, [products]);

  const createDefaultItem = (): OrderItemState => ({
    id: uuidv4(),
    productId: "",
    quantity: 0,
    unitPrice: 0,
    subtotal: 0,
  });

  const addEmptyItem = () => {
    setItems(prev => [...prev, createDefaultItem()]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (index: number, key: keyof OrderItemState, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const target = { ...updated[index] };
      (target as any)[key] = value;

      if (key === "quantity" || key === "unitPrice") {
        const qty = Number(target.quantity) || 0;
        const price = Number(target.unitPrice) || 0;
        target.subtotal = qty * price;

        // Si se usa moneda alternativa, convertir a esa moneda
        if (useForeignCurrency && exchangeRate > 0) {
          target.unitPriceOriginal = price * exchangeRate;
          target.subtotalOriginal = target.subtotal * exchangeRate;
        } else {
          target.unitPriceOriginal = price;
          target.subtotalOriginal = target.subtotal;
        }
      }

      updated[index] = target;
      return updated;
    });
  };

  // Actualizar conversiones cuando cambia el tipo de cambio o la moneda
  useEffect(() => {
    if (useForeignCurrency && exchangeRate > 0) {
      setItems(prev => prev.map(item => ({
        ...item,
        unitPriceOriginal: (item.unitPrice || 0) * exchangeRate,
        subtotalOriginal: (item.subtotal || 0) * exchangeRate,
      })));
    } else {
      setItems(prev => prev.map(item => ({
        ...item,
        unitPriceOriginal: item.unitPrice,
        subtotalOriginal: item.subtotal,
      })));
    }
  }, [useForeignCurrency, exchangeRate]);

  const getTotalAmount = () => {
    // Total en moneda base
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const getTotalOriginal = () => {
    // Total en moneda alternativa (si se usa)
    if (useForeignCurrency) {
      return items.reduce((sum, item) => sum + (item.subtotalOriginal || 0), 0);
    }
    return getTotalAmount();
  };

  const getTotalBase = () => {
    // Total en moneda base
    if (useForeignCurrency && exchangeRate > 0) {
      // Convertir de alternativa a base: dividir por tipo de cambio
      return getTotalOriginal() / exchangeRate;
    }
    return getTotalAmount();
  };

  useEffect(() => {
    if (useForeignCurrency && currencyCode && baseCurrency) {
      // Auto-fill exchange rate from API
      const rateKey = currencyCode.toLowerCase();
      if (currencyRates[rateKey]) {
        setExchangeRate(currencyRates[rateKey]);
      }
    } else if (!useForeignCurrency) {
      setExchangeRate(1);
      setCurrencyCode(baseCurrency || "");
    }
  }, [useForeignCurrency, currencyCode, baseCurrency]);

  // Separate effect to update exchange rate when currency rates are loaded
  useEffect(() => {
    if (useForeignCurrency && currencyCode && baseCurrency && currencyRates[currencyCode.toLowerCase()]) {
      setExchangeRate(currencyRates[currencyCode.toLowerCase()]);
    }
  }, [currencyRates]);

  const resetForm = () => {
    setSupplierId("");
    setWarehouseId("");
    setReferenceNumber("");
    setNotes("");
    setItems([]);
    setError("");
    setUseForeignCurrency(false);
    setCurrencyCode("");
    setExchangeRate(1);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!supplierId) {
      setError("Debe seleccionar un proveedor");
      setLoading(false);
      return;
    }

    if (!warehouseId) {
      setError("Debe seleccionar una bodega");
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError("Debe agregar al menos un item");
      setLoading(false);
      return;
    }

    if (useForeignCurrency) {
      if (!currencyCode) {
        setError("Debe seleccionar un código de moneda");
        setLoading(false);
        return;
      }
      if (!exchangeRate || exchangeRate <= 0) {
        setError("La tasa de cambio debe ser mayor a 0");
        setLoading(false);
        return;
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId) {
        setError(`Producto requerido para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        setError(`Cantidad debe ser mayor a 0 para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        setError(`Precio unitario debe ser mayor a 0 para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
    }

    try {
      const totalOriginal = getTotalOriginal();
      const totalBase = getTotalBase();

      const payload: CreatePurchaseOrderWithItemsPayload = {
        order: {
          tenantId,
          supplierId,
          warehouseId,
          userId,
          status: 'pending',
          referenceNumber,
          totalAmount: totalBase,
          notes,
          useForeignCurrency,
          currencyCode: useForeignCurrency ? currencyCode : undefined,
          exchangeRate: useForeignCurrency ? exchangeRate : undefined,
          totalOriginal: useForeignCurrency ? totalOriginal : undefined,
        },
        items: items.map(item => ({
          tenantId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice, // Precio unitario en moneda base
          subtotal: item.subtotal, // Subtotal en moneda base
          // Estos campos se calcularán en el backend si es necesario
        })),
      };

      await addWithItems(payload);
      resetForm();
      setUseForeignCurrency(false);
      setCurrencyCode("");
      setExchangeRate(1);
      onClose();
    } catch (error: any) {
      console.error("Create purchase order error:", error);
      setError(error?.response?.data?.message || "Error al crear la orden de compra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => { resetForm(); onClose(); }} className="flex items-center justify-center">
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Nueva Orden de Compra</h2>

        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Proveedor *</label>
          <Select
            options={supplierOptions}
            setFormInput={(value) => setSupplierId(value)}
            styles="border rounded p-2 w-full mb-3"
            value={supplierId}
          />

          <label className="block mb-2 text-sm font-medium">Bodega *</label>
          <Select
            options={warehouseOptions}
            setFormInput={(value) => setWarehouseId(value)}
            styles="border rounded p-2 w-full mb-3"
            value={warehouseId}
          />

          <label className="block mb-2 text-sm font-medium">Número de Referencia</label>
          <input
            type="text"
            placeholder="Número de Referencia"
            className="border rounded p-2 w-full mb-3"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium">Notas</label>
          <input
            type="text"
            placeholder="Notas"
            className="border rounded p-2 w-full mb-3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <hr className="my-3" />
          <h3 className="text-lg font-semibold mb-2">Items</h3>

          {items.map((item, idx) => (
            <Box key={item.id} className="border p-3 rounded mb-2 bg-gray-50">
              <label className="block mb-2 text-sm font-medium bg-blue-100 p-2 rounded text-center">Item {idx + 1}</label>

              <label className="block mb-2 text-sm font-medium">Producto *</label>
              <Select
                options={productOptions}
                setFormInput={(value) => handleUpdateItem(idx, "productId", value)}
                styles="border rounded p-2 w-full mb-3"
                value={item.productId}
              />

              <label className="block mb-2 text-sm font-medium">Cantidad *</label>
              <Input
                type="number"
                placeholder="Cantidad"
                value={item.quantity || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateItem(idx, "quantity", Number(e.target.value))}
              />

              <label className="block mb-2 text-sm font-medium">
                Precio Unitario * {useForeignCurrency && currencyCode ? `(${currencyCode})` : `(${baseCurrency || 'Base'})`}
              </label>
              <Input
                type="number"
                placeholder="Precio Unitario"
                step="any"
                value={useForeignCurrency ? (item.unitPriceOriginal || 0) : (item.unitPrice || 0)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.target.value);
                  if (useForeignCurrency && exchangeRate > 0) {
                    // Si está en moneda alternativa, convertir a base
                    handleUpdateItem(idx, "unitPrice", value / exchangeRate);
                  } else {
                    handleUpdateItem(idx, "unitPrice", value);
                  }
                }}
              />
              {useForeignCurrency && (
                <p className="text-xs text-gray-500 mt-1">
                  En {baseCurrency}: {(item.unitPrice || 0).toFixed(2)}
                </p>
              )}

              <label className="block mb-2 text-sm font-medium">
                Subtotal {useForeignCurrency && currencyCode ? `(${currencyCode})` : `(${baseCurrency || 'Base'})`}
              </label>
              <Input
                type="number"
                placeholder="Subtotal"
                value={useForeignCurrency ? (item.subtotalOriginal || 0) : (item.subtotal || 0)}
                readOnly
                onChange={() => { }}
              />
              {useForeignCurrency && (
                <p className="text-xs text-gray-500 mt-1">
                  En {baseCurrency}: {(item.subtotal || 0).toFixed(2)}
                </p>
              )}

              <Button color="error" variant="outlined" onClick={() => handleRemoveItem(idx)}>
                Eliminar
              </Button>
            </Box>
          ))}

          <Button variant="outlined" color="primary" onClick={addEmptyItem} className="mb-3">
            Agregar Item
          </Button>

          <hr className="my-3" />

          <FormControlLabel
            control={
              <Checkbox
                checked={useForeignCurrency}
                onChange={(e) => setUseForeignCurrency(e.target.checked)}
              />
            }
            label="Registrar usando una moneda diferente"
            className="mb-3"
          />

          {useForeignCurrency && (
            <>
              <label className="block mb-2 text-sm font-medium">Código de Moneda *</label>
              {availableCurrencies.length > 0 ? (
                <Select
                  options={availableCurrencies}
                  setFormInput={(value) => setCurrencyCode(value)}
                  styles="border rounded p-2 w-full mb-3"
                  value={currencyCode}
                />
              ) : (
                <>
                  <Select
                    options={[
                      { value: "USD", label: "USD" },
                      { value: "EUR", label: "EUR" },
                      { value: "PEN", label: "PEN" },
                    ]}
                    setFormInput={(value) => setCurrencyCode(value)}
                    styles="border rounded p-2 w-full mb-3"
                    value={currencyCode}
                  />
                  {!baseCurrency && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ Configura primero la moneda base en Configuración para obtener tasas de cambio automáticas
                    </p>
                  )}
                </>
              )}

              <label className="block mb-2 text-sm font-medium">Tasa de Cambio *</label>
              <Input
                type="number"
                placeholder="Tasa de Cambio"
                step="any"
                value={exchangeRate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExchangeRate(Number(e.target.value))}
              />
              {baseCurrency && currencyCode && currencyRates[currencyCode.toLowerCase()] && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Tasa automática: {currencyRates[currencyCode.toLowerCase()].toFixed(4)}
                </p>
              )}

              <label className="block mb-2 text-sm font-medium mt-3">Total (Moneda Original: {currencyCode})</label>
              <Input
                type="number"
                placeholder="Total Original"
                step="any"
                value={getTotalOriginal()}
                onChange={() => { }}
              />
            </>
          )}

          <label className="block mb-2 text-sm font-medium mt-3">Total (Moneda Base: {baseCurrency || "No configurada"})</label>
          <Input
            type="number"
            placeholder="Total Base"
            value={getTotalBase()}
            readOnly
            onChange={() => { }}
          />

          {error && (
            <Alert
              type="error"
              boldMessage="Error: "
              message={error}
              styles="mb-4"
            />
          )}

          <div className="flex justify-between mt-4">
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              color="success"
              type="submit"
              disabled={loading || items.length === 0}
            >
              Crear Orden
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}

