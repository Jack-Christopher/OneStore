module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("stock_movements", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "warehouse_id", "product_id", "movement_type", "quantity", "created_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            warehouse_id: { bsonType: "string" },
            product_id: { bsonType: "string" },
            movement_type: { bsonType: "string", enum: ["purchase", "sale", "adjustment_in", "adjustment_out", "transfer_in", "transfer_out"] },
            quantity: { bsonType: ["double", "int", "null"] },
            related_id: { bsonType: ["string", "null"] },
            comment: { bsonType: ["string", "null"] },
            metadata: { bsonType: ["object", "null"] },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: ["date", "null"] },
            created_by: { bsonType: ["string", "null"] },
            updated_by: { bsonType: ["string", "null"] }
          }
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    await db.collection("stock_movements").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { warehouse_id: 1 } },
      { key: { product_id: 1 } },
      { key: { movement_type: 1 } },
      { key: { created_at: -1 } }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("stock_movements").drop();
  }
};
