module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("warehouse_products", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "warehouse_id", "product_id", "quantity", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            warehouse_id: { bsonType: "string" },
            product_id: { bsonType: "string" },
            quantity: { bsonType: "double" },
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

    await db.collection("warehouse_products").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { warehouse_id: 1, product_id: 1, tenant_id: 1 }, unique: true }
    ]);
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
