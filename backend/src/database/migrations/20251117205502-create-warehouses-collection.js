module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("warehouses", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "name", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            name: { bsonType: "string" },
            address: { bsonType: ["string", "null"] },
            phone: { bsonType: ["string", "null"] },
            is_active: { bsonType: "bool" },
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

    await db.collection("warehouses").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { tenant_id: 1, name: 1 }, unique: true }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("warehouses").drop();
  }
};
