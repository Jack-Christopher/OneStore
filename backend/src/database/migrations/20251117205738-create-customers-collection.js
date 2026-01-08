module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "customers" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("customers", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "name", "created_at", "updated_at"],
            properties: {
              tenant_id: { bsonType: "string" },
              name: { bsonType: "string" },
              document: { bsonType: ["string", "null"] },
              phone: { bsonType: ["string", "null"] },
              email: { bsonType: ["string", "null"] },
              address: { bsonType: ["string", "null"] },
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
    }

    // Create indexes (idempotent - will skip if already exist)
    const customersCollection = db.collection("customers");
    const existingIndexes = await customersCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { tenant_id: 1, document: 1 }, name: "tenant_id_1_document_1", options: { unique: true, sparse: true } }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await customersCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("customers").drop();
  }
};
