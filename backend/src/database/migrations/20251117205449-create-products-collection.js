module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("products", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "name", "sku", "sale_price", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            category_id: { bsonType: ["string", "null"] },
            unit_id: { bsonType: ["string", "null"] },
            name: { bsonType: "string" },
            sku: { bsonType: "string" },
            barcode: { bsonType: ["string", "null"] },
            purchase_price: { bsonType: ["double", "null"] },
            sale_price: { bsonType: "double" },
            min_stock: { bsonType: ["int", "null"] },
            max_stock: { bsonType: ["int", "null"] },
            description: { bsonType: ["string", "null"] },
            is_active: { bsonType: "bool" },
            metadata: { bsonType: ["object", "null"] },
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

    await db.collection("products").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { category_id: 1 } },
      { key: { unit_id: 1 } },
      { key: { tenant_id: 1, sku: 1 }, unique: true },
      { key: { barcode: 1 }, sparse: true }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("products").drop();
  }
};
