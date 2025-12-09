import { SaleUpdateDTO } from "./sales.types";
import { SaleItemDTO } from "../saleItems/saleItems.types";
import { toSnakeCase } from "../../shared/utils/object";

const repo = require("./sales.repository");
const saleItemsRepo = require("../saleItems/saleItems.repository");
const stockMovementsService = require("../stockMovements/stockMovements.service");
const warehouseProductsService = require("../warehouseProducts/warehouseProducts.service");
const settingsService = require("../settings/settings.service");

async function getAll(user_id: string) {
  return repo.findAll(user_id);
}

async function getOne(id: string) {
  return repo.findById(id);
}

async function create(dto: SaleUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.create(formattedData);
}

interface CreateSaleWithItemsDTO {
  sale: SaleUpdateDTO & {
    useForeignCurrency?: boolean;
    currencyCode?: string;
    exchangeRate?: number;
    totalOriginal?: number;
  };
  items: SaleItemDTO[];
}

async function createWithItems(dto: CreateSaleWithItemsDTO, userId: string) {
  // Get base currency
  const baseCurrency = await settingsService.getBaseCurrency(userId);
  if (!baseCurrency) {
    throw new Error("Base currency must be set before creating transactions");
  }

  // Validate and process currency fields
  const saleData: any = toSnakeCase(dto.sale);
  
  // Check if using foreign currency
  const useForeignCurrency = dto.sale.useForeignCurrency || false;
  
  if (useForeignCurrency) {
    // Validate required fields
    if (!dto.sale.currencyCode) {
      throw new Error("currency_code is required when using foreign currency");
    }
    if (!dto.sale.exchangeRate || dto.sale.exchangeRate <= 0) {
      throw new Error("exchange_rate must be greater than 0");
    }
    if (dto.sale.totalOriginal === undefined || dto.sale.totalOriginal === null) {
      throw new Error("total_original is required when using foreign currency");
    }
    
    saleData.currency_code = dto.sale.currencyCode.toUpperCase();
    saleData.exchange_rate = dto.sale.exchangeRate;
    // total_original is the sum of all item subtotals in alternative currency
    // total_base is total_original converted back to base currency (divide by exchange rate)
    saleData.total_original = dto.sale.totalOriginal;
    saleData.total_base = dto.sale.totalOriginal / dto.sale.exchangeRate;
  } else {
    // Use base currency
    saleData.currency_code = baseCurrency;
    saleData.exchange_rate = 1;
    saleData.total_original = saleData.total_amount || 0;
    saleData.total_base = saleData.total_amount || 0;
  }
  
  // Keep total_amount for backward compatibility
  saleData.total_amount = saleData.total_base;

  const sale = await repo.create(saleData);

  if (dto.items && dto.items.length > 0) {
    const itemsData = dto.items.map(item => {
      const itemData: any = toSnakeCase(item);
      itemData.sale_id = sale._id.toString();
      
      // Calculate currency fields for items
      // item.unitPrice and item.subtotal are in base currency
      if (useForeignCurrency) {
        // Convert from base to alternative: multiply by exchange rate
        itemData.unit_price_original = (item.unitPrice || 0) * saleData.exchange_rate;
        itemData.unit_price_base = item.unitPrice || 0;
      } else {
        itemData.unit_price_original = item.unitPrice || 0;
        itemData.unit_price_base = item.unitPrice || 0;
      }
      
      // Keep unit_price for backward compatibility
      itemData.unit_price = itemData.unit_price_base;
      
      return itemData;
    });
    await saleItemsRepo.createMany(itemsData);

    // Create stock movements and update warehouse products for each item
    for (const item of dto.items) {
      // Create stock movement (exit)
      await stockMovementsService.create({
        tenantId: dto.sale.tenantId,
        warehouseId: dto.sale.warehouseId,
        productId: item.productId,
        movementType: 'sale',
        quantity: item.quantity,
        relatedId: sale._id.toString(),
        comment: `Venta #${sale._id}`,
        createdBy: userId
      });

      // Decrement warehouse product quantity
      await warehouseProductsService.decrementQuantity(
        dto.sale.tenantId,
        dto.sale.warehouseId,
        item.productId,
        item.quantity
      );
    }
  }

  return sale;
}

async function update(id: string, dto: SaleUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.update(id, formattedData);
}

async function remove(id: string) {
  return repo.delete(id);
}

async function cancelSale(id: string, userId: string) {
  const sale = await repo.findById(id);
  if (!sale) return null;
  if (sale.status === 'canceled') return sale;

  const items = await saleItemsRepo.findAllBySaleId(id);

  // Reverse stock movements for each item
  for (const item of items) {
    // Create reverse stock movement (entry)
    await stockMovementsService.create({
      tenantId: sale.tenant_id,
      warehouseId: sale.warehouse_id,
      productId: item.product_id,
      movementType: 'adjustment_in',
      quantity: item.quantity,
      relatedId: sale._id.toString(),
      comment: `Cancelación de venta #${sale._id}`,
      createdBy: userId
    });

    // Restore warehouse product quantity
    await warehouseProductsService.incrementQuantity(
      sale.tenant_id,
      sale.warehouse_id,
      item.product_id,
      item.quantity
    );
  }

  // Update sale status
  return repo.update(id, { status: 'canceled', updated_by: userId });
}

module.exports = {
  getAll,
  getOne,
  create,
  createWithItems,
  update,
  remove,
  cancelSale
};
