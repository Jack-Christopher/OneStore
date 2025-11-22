module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("tenant_settings", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "key", "value", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            key: { bsonType: "string" },
            value: { bsonType: ["object", "array", "string", "number", "null"] },
            description: { bsonType: ["string", "null"] },
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

    await db.collection("tenant_settings").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { tenant_id: 1, key: 1 }, unique: true }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("tenant_settings").drop();
  }
};
