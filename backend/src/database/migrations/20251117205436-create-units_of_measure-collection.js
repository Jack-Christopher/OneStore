module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "units_of_measure" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
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
    }

    // Create indexes (idempotent - will skip if already exist)
    const unitsCollection = db.collection("units_of_measure");
    const existingIndexes = await unitsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { tenant_id: 1, code: 1 }, name: "tenant_id_1_code_1", options: { unique: true } }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await unitsCollection.createIndex(index.key, options);
      }
    }
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
