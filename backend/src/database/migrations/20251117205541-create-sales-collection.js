module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("sales", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "warehouse_id", "user_id", "status", "total_amount", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            warehouse_id: { bsonType: "string" },
            user_id: { bsonType: "string" },
            customer_name: { bsonType: ["string", "null"] },
            customer_document: { bsonType: ["string", "null"] },
            status: { bsonType: "string", enum: ["completed", "canceled"] },
            payment_method: { bsonType: ["string", "null"] },
            total_amount: { bsonType: "double" },
            notes: { bsonType: ["string", "null"] },
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

    await db.collection("sales").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { warehouse_id: 1 } }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("sales").drop();
  }
};
