module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("units_of_measure", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "code", "name", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            code: { bsonType: "string" },
            name: { bsonType: "string" },
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

    await db.collection("units_of_measure").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { tenant_id: 1, code: 1 }, unique: true }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("units_of_measure").drop();
  }
};
