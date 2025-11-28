module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("product_formulas", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "name", "items"],
          properties: {
            tenant_id: { bsonType: "string" },
            name: { bsonType: "string" },
            description: { bsonType: "string" },
            items: {
              bsonType: "array",
              minItems: 1,
              items: {
                bsonType: "object",
                required: ["product_id", "quantity"],
                properties: {
                  product_id: { bsonType: "string" },
                  quantity: { bsonType: "number" }
                }
              }
            },
            is_active: { bsonType: "bool" },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" },
            created_by: { bsonType: "string" },
            updated_by: { bsonType: "string" }
          }
        }
      }
    });

    await db.collection("product_formulas").createIndex({ tenant_id: 1 });
    await db.collection("product_formulas").createIndex({ name: 1, tenant_id: 1 }, { unique: true });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection("product_formulas").drop();
  }
};
