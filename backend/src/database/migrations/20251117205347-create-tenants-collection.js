module.exports = {
  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "tenants" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
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
    }

    // Create indexes (idempotent - will skip if already exist)
    const tenantsCollection = db.collection("tenants");
    const existingIndexes = await tenantsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { name: 1 }, name: "name_1" },
      { key: { document_number: 1 }, name: "document_number_1", options: { sparse: true, unique: true } }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await tenantsCollection.createIndex(index.key, options);
      }
    }
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
