module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("purchase_order_items", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "purchase_order_id", "product_id", "quantity", "unit_price", "subtotal", "created_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            purchase_order_id: { bsonType: "string" },
            product_id: { bsonType: "string" },
            quantity: { bsonType: ["double", "int", "null"] },
            unit_price: { bsonType: ["double", "int", "null"] },
            subtotal: { bsonType: ["double", "int", "null"] },
            received_quantity: { bsonType: ["double", "int", "null"] },
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

    await db.collection("purchase_order_items").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { purchase_order_id: 1 } },
      { key: { product_id: 1 } }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("purchase_order_items").drop();
  }
};
