module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "warehouse_products" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("warehouse_products", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "warehouse_id", "product_id", "quantity", "created_at", "updated_at"],
            properties: {
              tenant_id: { bsonType: "string" },
              warehouse_id: { bsonType: "string" },
              product_id: { bsonType: "string" },
              quantity: { bsonType: ["double", "int", "null"] },
              reserved: { bsonType: ["double", "null"] },
              available: { bsonType: ["double", "null"] },
              created_at: { bsonType: "date" },
              updated_at: { bsonType: "date" },
              created_by: { bsonType: ["string", "null"] },
              updated_by: { bsonType: ["string", "null"] }
            }
          }
        },
        validationLevel: "strict",
        validationAction: "error"
      });
    }

    // Create indexes (idempotent - will skip if already exist)
    const warehouseProductsCollection = db.collection("warehouse_products");
    const existingIndexes = await warehouseProductsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { warehouse_id: 1, product_id: 1, tenant_id: 1 }, name: "warehouse_id_1_product_id_1_tenant_id_1", options: { unique: true } }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await warehouseProductsCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("warehouse_products").drop();
  }
};
