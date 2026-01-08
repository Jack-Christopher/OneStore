module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "suppliers" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("suppliers", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "name", "created_at", "updated_at"],
            properties: {
              tenant_id: { bsonType: "string" },
              name: { bsonType: "string" },
              contact_name: { bsonType: ["string", "null"] },
              document: { bsonType: ["string", "null"] },
              phone: { bsonType: ["string", "null"] },
              email: { bsonType: ["string", "null"] },
              address: { bsonType: ["string", "null"] },
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
    }

    // Create indexes (idempotent - will skip if already exist)
    const suppliersCollection = db.collection("suppliers");
    const existingIndexes = await suppliersCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { tenant_id: 1, name: 1 }, name: "tenant_id_1_name_1" }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await suppliersCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("suppliers").drop();
  }
};
