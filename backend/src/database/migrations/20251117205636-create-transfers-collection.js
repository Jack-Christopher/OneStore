module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("transfers", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "from_warehouse_id", "to_warehouse_id", "user_id", "status", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            from_warehouse_id: { bsonType: "string" },
            to_warehouse_id: { bsonType: "string" },
            user_id: { bsonType: "string" },
            status: { bsonType: "string", enum: ["pending", "completed", "canceled"] },
            reference: { bsonType: ["string", "null"] },
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

    await db.collection("transfers").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { from_warehouse_id: 1 } },
      { key: { to_warehouse_id: 1 } }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("transfers").drop();
  }
};
