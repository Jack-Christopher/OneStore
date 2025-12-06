module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("purchase_orders", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "supplier_id", "warehouse_id", "user_id", "status", "total_amount", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            supplier_id: { bsonType: "string" },
            warehouse_id: { bsonType: "string" },
            user_id: { bsonType: "string" },
            status: { bsonType: "string", enum: ["pending", "received", "canceled"] },
            reference_number: { bsonType: ["string", "null"] },
            total_amount: { bsonType: ["double", "int", "null"] },
            notes: { bsonType: ["string", "null"] },
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

    await db.collection("purchase_orders").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { supplier_id: 1 } },
      { key: { warehouse_id: 1 } },
      { key: { reference_number: 1 }, sparse: true }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("purchase_orders").drop();
  }
};
