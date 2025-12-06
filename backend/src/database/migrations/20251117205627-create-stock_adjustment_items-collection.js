module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("stock_adjustment_items", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "adjustment_id", "product_id", "old_quantity", "new_quantity", "difference", "created_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            adjustment_id: { bsonType: "string" },
            product_id: { bsonType: "string" },
            old_quantity: { bsonType: ["double", "int", "null"] },
            new_quantity: { bsonType: ["double", "int", "null"] },
            difference: { bsonType: ["double", "int", "null"] },
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

    await db.collection("stock_adjustment_items").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { adjustment_id: 1 } },
      { key: { product_id: 1 } }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("stock_adjustment_items").drop();
  }
};
