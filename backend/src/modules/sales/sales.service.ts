import { SaleUpdateDTO } from "./sales.types";
import { SaleItemDTO } from "../saleItems/saleItems.types";
import { toSnakeCase } from "../../shared/utils/object";

const repo = require("./sales.repository");
const saleItemsRepo = require("../saleItems/saleItems.repository");
const stockMovementsService = require("../stockMovements/stockMovements.service");
const warehouseProductsService = require("../warehouseProducts/warehouseProducts.service");

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
  sale: SaleUpdateDTO;
  items: SaleItemDTO[];
}

async function createWithItems(dto: CreateSaleWithItemsDTO, userId: string) {
  const saleData = toSnakeCase(dto.sale);
  const sale = await repo.create(saleData);

  if (dto.items && dto.items.length > 0) {
    const itemsData = dto.items.map(item => ({
      ...toSnakeCase(item),
      sale_id: sale._id.toString()
    }));
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
