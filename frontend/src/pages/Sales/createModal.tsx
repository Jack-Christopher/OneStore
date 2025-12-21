import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Modal, Checkbox, FormControlLabel } from "@mui/material";
import { SalesErrorMessages } from "@/constants/salesErrors";
import Alert from "@/components/Alert";
import type { CreateSalePayload, CreateSaleWithItemsPayload } from "@/services/api/sales";
import type { CreateSaleItemState } from "@/services/api/saleItems";
import type { CreateSaleItemPayload } from "@/services/api/saleItems";
import { v4 as uuidv4 } from 'uuid';
import Select, { type SelectOption } from "@/components/Select";
import { useProductsStore } from "@/store/productsStore";
import type { Product } from "@/services/api/products";
import { useUnitsOfMeasureStore } from "@/store/unitsOfMeasureStore";
import type { UnitOfMeasure } from "@/services/api/unitsOfMeasure";
import type { CreateProductFormulaItem, ProductFormula } from "@/services/api/productFormulas";
import { useProductFormulasStore } from "@/store/productFormulasStore";
import { useCustomersStore } from "@/store/customersStore";
import type { Customer } from "@/services/api/customers";
import Input from "@/components/Input";
import { getBaseCurrency, getCurrencyRates } from "@/services/api/settings";
import { createSaleWithItems } from "@/services/api/sales";
import { multiply, divide, cleanFloat } from "@/utils/math";


interface SalesCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SalesCreateModal({ open, onClose, onSuccess }: SalesCreateModalProps) {
  const { items: productItems, fetch: fetchProducts } = useProductsStore();
  const { items: unitsOfMeasureItems, fetch: fetchUnitsOfMeasure } = useUnitsOfMeasureStore();
  const { items: productFormulasItems, fetch: fetchProductFormulas } = useProductFormulasStore();
  const { items: customerItems, fetch: fetchCustomers } = useCustomersStore();

  const tenantId = useAuthStore.getState().authUser?.user?.tenantId || "orphan";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const boxStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '80vh',
    overflowY: 'auto',
  };

  const defaultSaleFormData: CreateSalePayload = {
    tenantId: tenantId,
    warehouseId: "main",
    userId: useAuthStore.getState().authUser?.user?.id || "ghost",
    customerName: "Cliente varios",
    customerDocument: "",
    status: "completed",
    paymentMethod: "En efectivo",
    totalAmount: 0,
    notes: "",
  };


  const toSelectOption = (obj: UnitOfMeasure | Product | ProductFormula) => {
    return {
      value: obj._id,
      label: obj.name,
    }
  }

  const toCustomerSelectOption = (customer: Customer) => {
    return {
      value: customer._id,
      label: `${customer.name}${customer.document ? ` (${customer.document})` : ''}`,
    }
  }


  useEffect(() => {
    const initialize = async () => {
      if (open) {
        await fetchProducts();
        await fetchUnitsOfMeasure();
        await fetchProductFormulas();
        await fetchCustomers();

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
      }
    };

    initialize();
  }, [open]);

  // Update products when productItems change
  useEffect(() => {
    setProducts(productItems.map((pi) => toSelectOption(pi)));
  }, [productItems]);

  // Update units of measure when unitsOfMeasureItems change
  useEffect(() => {
    setUnitsOfMeasure(unitsOfMeasureItems.map((uomi => toSelectOption(uomi))));
  }, [unitsOfMeasureItems]);

  // Update product formulas when productFormulasItems change
  useEffect(() => {
    setProductFormulas(productFormulasItems.map((f) => toSelectOption(f)));
  }, [productFormulasItems]);

  // Update customers when customerItems change
  useEffect(() => {
    console.log("customerItems updated:", customerItems);
    if (customerItems && customerItems.length > 0) {
      // Filter active customers - handle both camelCase and snake_case
      const activeCustomers = customerItems.filter(c => {
        const isActive = (c as any).isActive !== undefined
          ? (c as any).isActive
          : (c as any).is_active !== undefined
            ? (c as any).is_active
            : true; // Default to active if not specified
        return isActive !== false;
      });
      console.log("activeCustomers:", activeCustomers);
      const customerOptions = activeCustomers.map((c) => toCustomerSelectOption(c));
      console.log("customerOptions:", customerOptions);
      setCustomers(customerOptions);
    } else {
      setCustomers([]);
    }
  }, [customerItems]);


  // factory that creates a fresh item object (new id every time)
  const createDefaultSaleItem = (): CreateSaleItemState => ({
    id: uuidv4(),
    tenantId: tenantId,
    saleId: "",
    productId: "",
    unitId: "",
    quantity: 0,
    unitPrice: 0,
    subtotal: 0,
  });

  const [saleForm, setSaleForm] = useState<CreateSalePayload>(defaultSaleFormData);
  const [items, setItems] = useState<CreateSaleItemState[]>([]);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<SelectOption[]>([]);
  const [productFormulas, setProductFormulas] = useState<SelectOption[]>([]);
  const [customers, setCustomers] = useState<SelectOption[]>([]);
  const [useForeignCurrency, setUseForeignCurrency] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [baseCurrency, setBaseCurrency] = useState<string | null>(null);
  const [currencyRates, setCurrencyRates] = useState<Record<string, number>>({});
  const [availableCurrencies, setAvailableCurrencies] = useState<SelectOption[]>([]);

  const [openFormulaModal, setOpenFormulaModal] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<SelectOption | null>(null);
  const [desiredQuantity, setDesiredQuantity] = useState<number>(0);


  const handleRemoveItem = (idx: number) => {
    if (idx < 0 || idx >= items.length) {
      console.error("Error: Index out of range when deleting a Sale item form");
      return;
    }
    // create new array without the item (immutable)
    setItems(prev => {
      const next = prev.slice(0, idx).concat(prev.slice(idx + 1));
      // update total
      const total = next.reduce((sum, it) => sum + (it.subtotal || 0), 0);
      setSaleForm(s => ({ ...s, totalAmount: total }));
      return next;
    });
  };

  const addEmptyItem = () => {
    setItems(prev => [...prev, createDefaultSaleItem()]);
  };

  // Memoize selected formula data to avoid recalculation on every render
  const selectedFormulaData = useMemo(() => {
    return selectedFormula
      ? productFormulasItems.find(f => f._id === selectedFormula.value)
      : null;
  }, [selectedFormula, productFormulasItems]);

  // Memoize reference unit calculation
  const referenceUnit = useMemo(() => {
    if (!selectedFormulaData) return null;

    const referenceUnitIdRaw = (selectedFormulaData as any)?.referenceUnitId || (selectedFormulaData as any)?.reference_unit_id;
    const referenceUnitIdValue = referenceUnitIdRaw
      ? (typeof referenceUnitIdRaw === 'object' && referenceUnitIdRaw !== null
        ? referenceUnitIdRaw._id || referenceUnitIdRaw.id
        : referenceUnitIdRaw)
      : null;

    return referenceUnitIdValue
      ? unitsOfMeasureItems.find(u => u._id === referenceUnitIdValue)
      : null;
  }, [selectedFormulaData, unitsOfMeasureItems]);

  // Memoize reference quantity
  const refQty = useMemo(() => {
    return selectedFormulaData
      ? ((selectedFormulaData as any)?.referenceQuantity || (selectedFormulaData as any)?.reference_quantity || 0)
      : 0;
  }, [selectedFormulaData]);

  // Stable handlers to prevent re-renders
  const handleCloseModal = useCallback(() => {
    setOpenFormulaModal(false);
  }, []);

  const handleFormulaSelect = useCallback((value: string) => {
    setSelectedFormula(productFormulas.find((f) => f.value === value) || null);
    setDesiredQuantity(0);
  }, [productFormulas]);

  const handleDesiredQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDesiredQuantity(Number(e.target.value));
  }, []);

  const handleCancelFormula = useCallback(() => {
    setOpenFormulaModal(false);
    setSelectedFormula(null);
    setDesiredQuantity(0);
  }, []);


  const handleAddItemWithFormula = useCallback((formulaItem: CreateProductFormulaItem) => {
    const newItem = { ...createDefaultSaleItem(), productId: formulaItem.productId, unitId: formulaItem.unitId, quantity: formulaItem.quantity };

    // Autocomplete unitPrice from product's salePrice (handle both snake_case and camelCase)
    const selectedProduct = productItems.find(p => p._id === formulaItem.productId);
    if (selectedProduct) {
      // Get sub_units_per_unit for price calculation
      const subUnitsPerUnit = (selectedProduct as any).subUnitsPerUnit || (selectedProduct as any).sub_units_per_unit || 1;
      
      // If product has sub-units, divide price by sub-units to get price per sub-unit
      const baseUnitPrice = (selectedProduct as any).salePrice || (selectedProduct as any).sale_price || 0;
      const pricePerSubUnit = subUnitsPerUnit > 1 ? baseUnitPrice / subUnitsPerUnit : baseUnitPrice;
      newItem.unitPrice = pricePerSubUnit;

      // Ensure unitId matches product's unitId (handle both snake_case and camelCase, and object/string cases)
      const unitIdField = (selectedProduct as any).unitId || (selectedProduct as any).unit_id;
      if (typeof unitIdField === 'object' && unitIdField !== null) {
        newItem.unitId = unitIdField._id || formulaItem.unitId;
      } else {
        newItem.unitId = unitIdField || formulaItem.unitId;
      }

      // Recalculate subtotal (quantity is in sub-units, price is per sub-unit)
      newItem.subtotal = multiply(newItem.quantity || 0, newItem.unitPrice || 0);
    }

    setItems(prev => {
      const updated = [...prev, newItem];
      // Recalculate total
      const total = cleanFloat(updated.reduce((sum, it) => sum + (it.subtotal || 0), 0));
      setSaleForm(s => ({ ...s, totalAmount: total }));
      return updated;
    });
  }, [productItems]);


  // Memoize applyFormula to prevent recreation
  const handleApplyFormula = useCallback(() => {
    // Validate desired quantity
    if (!desiredQuantity || desiredQuantity <= 0) {
      setError("La cantidad deseada debe ser mayor a 0");
      return;
    }

    const formulaId = selectedFormula?.value;
    const formula = productFormulasItems.find(f => f._id === formulaId);
    if (!formula) {
      setError("Fórmula no encontrada");
      return;
    }

    // Handle both snake_case and camelCase formats
    const referenceQuantity = (formula as any).referenceQuantity || (formula as any).reference_quantity || 0;

    // Validate formula has reference quantity
    if (!referenceQuantity || referenceQuantity <= 0) {
      setError("La fórmula no tiene una cantidad de referencia válida");
      return;
    }

    // Calculate multiplier: desiredQuantity / referenceQuantity
    const multiplier = divide(desiredQuantity, referenceQuantity);

    // Apply multiplier to each ingredient
    formula.items.forEach((item) => {
      const originalQuantity = typeof item.quantity === 'number' ? item.quantity : 0;
      const adjustedQuantity = multiply(originalQuantity, multiplier);

      handleAddItemWithFormula({
        id: uuidv4(),
        // @ts-ignore TODO: fix this
        productId: item.product_id || item.productId,
        // @ts-ignore TODO: fix this
        unitId: item.unit_id || item.unitId,
        quantity: adjustedQuantity,
      });
    });

    setOpenFormulaModal(false);
    setSelectedFormula(null);
    setDesiredQuantity(0);
    setError(""); // Clear any previous errors
  }, [desiredQuantity, selectedFormula, productFormulasItems, handleAddItemWithFormula]);



  const resetForm = () => {
    setSaleForm(defaultSaleFormData);
    setItems([]);
    setUseForeignCurrency(false);
    setCurrencyCode("");
    setExchangeRate(1);
    setError("");
    setOpenFormulaModal(false);
    setSelectedFormula(null);
    setDesiredQuantity(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleUpdateItem = (index: number, key: keyof CreateSaleItemState, value: any) => {
    setItems(prev => {
      const updated = prev.slice(); // shallow clone array
      const target = { ...updated[index] }; // clone target object
      // @ts-ignore TODO: fix this
      target[key] = value;

      // When product is selected, autocomplete unitPrice and unitId
      if (key === "productId" && value) {
        const selectedProduct = productItems.find(p => p._id === value);
        if (selectedProduct) {
          // Get sub_units_per_unit for price calculation
          const subUnitsPerUnit = (selectedProduct as any).subUnitsPerUnit || (selectedProduct as any).sub_units_per_unit || 1;
          
          // Autocomplete unitPrice with salePrice (handle both snake_case and camelCase)
          // If product has sub-units, divide price by sub-units to get price per sub-unit
          const baseUnitPrice = (selectedProduct as any).salePrice || (selectedProduct as any).sale_price || 0;
          const pricePerSubUnit = subUnitsPerUnit > 1 ? baseUnitPrice / subUnitsPerUnit : baseUnitPrice;
          target.unitPrice = pricePerSubUnit;

          // Si se usa moneda alternativa, convertir
          if (useForeignCurrency && exchangeRate > 0) {
            target.unitPriceOriginal = multiply(pricePerSubUnit, exchangeRate);
          } else {
            target.unitPriceOriginal = pricePerSubUnit;
          }

          // Autocomplete unitId with product's unitId (handle both snake_case and camelCase, and object/string cases)
          const unitIdField = (selectedProduct as any).unitId || (selectedProduct as any).unit_id;
          if (typeof unitIdField === 'object' && unitIdField !== null) {
            target.unitId = unitIdField._id || "";
          } else {
            target.unitId = unitIdField || "";
          }
        }
      }

      // recalc subtotal if needed
      if (key === "quantity" || key === "unitPrice" || key === "productId") {
        const qty = Number(target.quantity) || 0;
        const price = Number(target.unitPrice) || 0;
        target.subtotal = multiply(qty, price);

        // Si se usa moneda alternativa, convertir subtotal
        if (useForeignCurrency && exchangeRate > 0) {
          target.subtotalOriginal = multiply(target.subtotal, exchangeRate);
        } else {
          target.subtotalOriginal = target.subtotal;
        }
      }

      updated[index] = target;

      // recalc sale total
      const total = cleanFloat(updated.reduce((sum, it) => sum + (it.subtotal || 0), 0));
      setSaleForm(s => ({ ...s, totalAmount: total }));

      return updated;
    });
  };

  // Actualizar conversiones cuando cambia el tipo de cambio o la moneda
  useEffect(() => {
    if (useForeignCurrency && exchangeRate > 0) {
      setItems(prev => prev.map(item => ({
        ...item,
        unitPriceOriginal: multiply(item.unitPrice || 0, exchangeRate),
        subtotalOriginal: multiply(item.subtotal || 0, exchangeRate),
      })));
    } else {
      setItems(prev => prev.map(item => ({
        ...item,
        unitPriceOriginal: item.unitPrice,
        subtotalOriginal: item.subtotal,
      })));
    }
  }, [useForeignCurrency, exchangeRate]);

  const getTotalOriginal = () => {
    // Total en moneda alternativa (si se usa)
    if (useForeignCurrency) {
      return cleanFloat(items.reduce((sum, item) => sum + (item.subtotalOriginal || 0), 0));
    }
    return cleanFloat(items.reduce((sum, it) => sum + (it.subtotal || 0), 0));
  };

  const getTotalBase = () => {
    // Total en moneda base
    if (useForeignCurrency && exchangeRate > 0) {
      // Convertir de alternativa a base: dividir por tipo de cambio
      return divide(getTotalOriginal(), exchangeRate);
    }
    return cleanFloat(items.reduce((sum, it) => sum + (it.subtotal || 0), 0));
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




  function toCreateSaleItemPayload(item: CreateSaleItemState): CreateSaleItemPayload {
    const { id, ...rest } = item;
    
    // Convert quantity from sub-units to base units
    const product = productItems.find(p => p._id === item.productId);
    const subUnitsPerUnit = (product as any)?.subUnitsPerUnit || (product as any)?.sub_units_per_unit || 1;
    const quantityInBaseUnits = subUnitsPerUnit > 1 ? rest.quantity / subUnitsPerUnit : rest.quantity;
    
    return {
      ...rest,
      quantity: quantityInBaseUnits,
    };
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    if (!saleForm.notes || !saleForm.paymentMethod || !saleForm.status) {
      setError("Debe completar todos los campos del formulario de venta");
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

    // Validate that all items have required fields filled
    console.log("items", items);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId || item.productId === "") {
        setError(`Producto requerido para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
      if (!item.unitId || item.unitId === "") {
        setError(`Unidad de medida requerida para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        setError(`Cantidad debe ser mayor a 0 para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }

      // Validate stock availability (convert quantity to base units for comparison)
      const product = productItems.find(p => p._id === item.productId);
      if (product) {
        const subUnitsPerUnit = (product as any)?.subUnitsPerUnit || (product as any)?.sub_units_per_unit || 1;
        const stockInUnits = product.currentStock || 0;
        // Convert entered quantity (in sub-units) to base units
        const quantityInBaseUnits = subUnitsPerUnit > 1 ? item.quantity / subUnitsPerUnit : item.quantity;
        const availableStockInSubUnits = stockInUnits * subUnitsPerUnit;
        
        if (quantityInBaseUnits > stockInUnits) {
          setError(`Stock insuficiente para el producto "${product.name}" en el ítem ${i + 1}. Stock disponible: ${availableStockInSubUnits.toFixed(2)} sub-unidades (${stockInUnits} unidades), solicitado: ${item.quantity} sub-unidades`);
          setLoading(false);
          return;
        }
      }

      if (!item.unitPrice || item.unitPrice <= 0) {
        setError(`Precio unitario debe ser mayor a 0 para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
      if (!item.subtotal || item.subtotal <= 0) {
        setError(`Subtotal debe ser mayor a 0 para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
    }
    try {
      const totalOriginal = getTotalOriginal();
      const totalBase = getTotalBase();

      const salePayload: CreateSalePayload = {
        ...saleForm,
        totalAmount: totalBase,
        useForeignCurrency,
        currencyCode: useForeignCurrency ? currencyCode : undefined,
        exchangeRate: useForeignCurrency ? exchangeRate : undefined,
        totalOriginal: useForeignCurrency ? totalOriginal : undefined,
      };

      const payload: CreateSaleWithItemsPayload = {
        sale: salePayload,
        items: items.map(it => toCreateSaleItemPayload(it)),
      };

      await createSaleWithItems(payload);

      resetForm();
      onClose();
      // Trigger refresh after successful creation
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.log(JSON.stringify(error, null, 2));
      console.error("Create sale error:", error);
      const code = error?.response?.data?.code;
      const msg = SalesErrorMessages[code] || error?.response?.data?.message || "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={(_e, reason) => { if (reason !== 'backdropClick') handleClose(); }}
      className="flex items-center justify-center"
    >
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Venta</h2>

        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Cliente</label>
          <Select
            options={[
              { value: "varios", label: "Cliente varios" },
              ...(customers || [])
            ]}
            setFormInput={(value) => {
              if (value === "varios" || value === "") {
                setSaleForm({ ...saleForm, customerName: "Cliente varios", customerDocument: "" });
              } else {
                const selectedCustomer = customerItems.find(c => c._id === value);
                if (selectedCustomer) {
                  setSaleForm({
                    ...saleForm,
                    customerName: selectedCustomer.name,
                    customerDocument: selectedCustomer.document || ""
                  });
                }
              }
            }}
            styles="border rounded p-2 w-full mb-3"
            value={saleForm.customerName === "Cliente varios" ? "varios" : customerItems.find(c => c.name === saleForm.customerName && (c.document || "") === (saleForm.customerDocument || ""))?._id || "varios"}
          />

          <label className="block mb-2 text-sm font-medium">Método de pago</label>
          <input
            type="text"
            placeholder="Método de pago"
            className="border rounded p-2 w-full mb-3"
            value={saleForm.paymentMethod}
            onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
          />

          <label className="block mb-2 text-sm font-medium">Notas</label>
          <input
            type="text"
            placeholder="Notas"
            className="border rounded p-2 w-full mb-3"
            value={saleForm.notes}
            onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
          />

          <hr className="my-3" />

          {items.map((item, idx) => (
            <Box key={item.id} className="border p-3 rounded mb-2 bg-gray-50">
              <label className="block mb-2 text-sm font-medium bg-blue-100 p-2 rounded text-center">Item {idx + 1}</label>
              <label className="block mb-2 text-sm font-medium">Producto</label>
              <Select
                options={products}
                setFormInput={(value) => handleUpdateItem(idx, "productId", value)}
                styles="border rounded p-2 w-full mb-3"
                value={item.productId}
              />
              <label className="block mb-2 text-sm font-medium">Unidad de Medida</label>
              <Select
                options={unitsOfMeasure}
                setFormInput={(value) => handleUpdateItem(idx, "unitId", value)}
                styles="border rounded p-2 w-full mb-3"
                value={item.unitId}
                disabled={!!item.productId}
              />
              <label className="block mb-2 text-sm font-medium">Cantidad</label>
              {(() => {
                const selectedProduct = productItems.find(p => p._id === item.productId);
                const subUnitsPerUnit = (selectedProduct as any)?.subUnitsPerUnit || (selectedProduct as any)?.sub_units_per_unit || 1;
                const stockInUnits = selectedProduct?.currentStock || 0;
                // Mostrar stock en sub-unidades para el usuario
                const availableStockInSubUnits = stockInUnits * subUnitsPerUnit;
                const quantity = item.quantity || 0;
                // La cantidad del item está en sub-unidades, convertir a unidades base para validar
                const quantityInBaseUnits = subUnitsPerUnit > 1 ? quantity / subUnitsPerUnit : quantity;
                const exceedsStock = quantityInBaseUnits > stockInUnits;
                
                // Obtener nombre de la unidad del producto
                const productUnitId = (selectedProduct as any)?.unitId?._id || (selectedProduct as any)?.unit_id?._id || (selectedProduct as any)?.unitId || (selectedProduct as any)?.unit_id;
                const productUnit = unitsOfMeasureItems.find(u => u._id === productUnitId);
                const unitName = productUnit?.name || 'unidad';
                const subUnitLabel = subUnitsPerUnit > 1 ? `(en sub-unidades de ${unitName})` : '';

                return (
                  <>
                    <div className={exceedsStock ? "border-2 border-red-500 rounded" : ""}>
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        step="any"
                        value={item.quantity || 0}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateItem(idx, "quantity", Number(e.target.value))}
                      />
                    </div>
                    {item.productId && (
                      <div className="text-sm mt-1">
                        {subUnitsPerUnit > 1 && (
                          <span className="text-blue-600 block mb-1">
                            📦 Cada {unitName} contiene {subUnitsPerUnit} sub-unidades
                          </span>
                        )}
                        <span className={availableStockInSubUnits > 0 ? 'text-green-600' : 'text-red-600'}>
                          Stock disponible: {availableStockInSubUnits.toFixed(2)} {subUnitLabel}
                        </span>
                        {subUnitsPerUnit > 1 && (
                          <span className="text-gray-500 block">
                            ({stockInUnits} {unitName}s en almacén)
                          </span>
                        )}
                        {exceedsStock && (
                          <span className="text-red-600 block">⚠️ La cantidad excede el stock disponible</span>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
              {(() => {
                const selectedProductForPrice = productItems.find(p => p._id === item.productId);
                const subUnitsPerUnitForPrice = (selectedProductForPrice as any)?.subUnitsPerUnit || (selectedProductForPrice as any)?.sub_units_per_unit || 1;
                const priceLabel = subUnitsPerUnitForPrice > 1 ? 'Precio por Sub-unidad' : 'Precio Unitario';
                
                return (
                  <>
                    <label className="block mb-2 text-sm font-medium">
                      {priceLabel} {useForeignCurrency && currencyCode ? `(${currencyCode})` : `(${baseCurrency || 'Base'})`}
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
                          handleUpdateItem(idx, "unitPrice", divide(value, exchangeRate));
                        } else {
                          handleUpdateItem(idx, "unitPrice", value);
                        }
                      }}
                    />
                    {subUnitsPerUnitForPrice > 1 && (
                      <p className="text-xs text-blue-600 mt-1">
                        Precio original por unidad completa: {((selectedProductForPrice as any)?.salePrice || (selectedProductForPrice as any)?.sale_price || 0).toFixed(2)}
                      </p>
                    )}
                  </>
                );
              })()}
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
                step="any"
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
              <Button
                color="error"
                variant="outlined"
                onClick={() => handleRemoveItem(idx)}
              >
                Eliminar
              </Button>
            </Box>
          ))}

          <div className="flex justify-center mb-2 gap-2">
            <Button variant="outlined" color="primary" onClick={addEmptyItem}>
              Agregar Item
            </Button>
            <Button variant="outlined" color="primary" onClick={() => setOpenFormulaModal(true)}>
              Aplicar Fórmula
            </Button>
          </div>

          <Modal open={openFormulaModal} onClose={handleCloseModal} className="flex items-center justify-center">
            <Box sx={boxStyle}>
              <h2 className="text-2xl font-bold mb-4 text-center">Aplicar Fórmula</h2>
              <label className="block mb-2 text-sm font-medium">Fórmula</label>
              <Select
                options={productFormulas}
                setFormInput={handleFormulaSelect}
                styles="border rounded p-2 w-full mb-3"
                value={selectedFormula?.value || ""}
              />
              {selectedFormulaData && (
                <>
                  <label className="block mb-2 text-sm font-medium">
                    Cantidad Deseada {referenceUnit && `(${referenceUnit.name})`}
                  </label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Cantidad Deseada"
                    value={desiredQuantity || 0}
                    onChange={handleDesiredQuantityChange}
                  />
                  {refQty > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Receta base: {refQty} {referenceUnit?.name || ''}
                    </p>
                  )}
                </>
              )}
              <div className="flex justify-center mb-2 gap-2 mt-4">
                <Button variant="outlined" color="error" onClick={handleCancelFormula}>Cancelar</Button>
                <Button variant="outlined" color="primary" onClick={handleApplyFormula}>Aplicar</Button>
              </div>
            </Box>
          </Modal>

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
              onClick={handleClose}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              color="success"
              type="submit"
              disabled={loading || items.length === 0}
            >
              Crear Venta
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}
