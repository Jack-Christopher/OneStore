module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("transfer_items", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "transfer_id", "product_id", "quantity", "created_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            transfer_id: { bsonType: "string" },
            product_id: { bsonType: "string" },
            quantity: { bsonType: "double" },
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

    await db.collection("transfer_items").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { transfer_id: 1 } },
      { key: { product_id: 1 } }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("transfer_items").drop();
  }
};
