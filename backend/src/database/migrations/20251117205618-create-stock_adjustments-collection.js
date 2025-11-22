module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("stock_adjustments", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "warehouse_id", "user_id", "reason", "created_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            warehouse_id: { bsonType: "string" },
            user_id: { bsonType: "string" },
            reason: { bsonType: "string" },
            notes: { bsonType: ["string", "null"] },
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

    await db.collection("stock_adjustments").createIndexes([
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
    await db.collection("stock_adjustments").drop();
  }
};
