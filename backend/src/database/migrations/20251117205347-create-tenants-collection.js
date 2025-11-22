module.exports = {
  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async up(db, client) {
    await db.createCollection("tenants", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "created_at", "updated_at"],
          properties: {
            name: { bsonType: "string", description: "display name" },
            legal_name: { bsonType: ["string", "null"] },
            document_type: { bsonType: ["string", "null"] },
            document_number: { bsonType: ["string", "null"] },
            address: { bsonType: ["string", "null"] },
            phone: { bsonType: ["string", "null"] },
            email: { bsonType: ["string", "null"] },
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

    await db.collection("tenants").createIndexes([
      { key: { _id: 1 } },
      { key: { name: 1 } },
      { key: { document_number: 1 }, sparse: true, unique: true }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("tenants").drop();
  }
};
