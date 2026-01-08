module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "stock_adjustments" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("stock_adjustments", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "warehouse_id", "user_id", "reason", "created_at"],
            properties: {
              tenant_id: { bsonType: "string" },
              warehouse_id: { bsonType: "string" },
              user_id: { bsonType: "string" },
              reason: { bsonType: "string" },
              notes: { bsonType: ["string", "null"] },
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
    }

    // Create indexes (idempotent - will skip if already exist)
    const adjustmentsCollection = db.collection("stock_adjustments");
    const existingIndexes = await adjustmentsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { warehouse_id: 1 }, name: "warehouse_id_1" }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await adjustmentsCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("stock_adjustments").drop();
  }
};
