module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "sales" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("sales", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "warehouse_id", "user_id", "status", "total_amount", "created_at", "updated_at"],
            properties: {
              tenant_id: { bsonType: "string" },
              warehouse_id: { bsonType: "string" },
              user_id: { bsonType: "string" },
              customer_name: { bsonType: ["string", "null"] },
              customer_document: { bsonType: ["string", "null"] },
              status: { bsonType: "string", enum: ["completed", "canceled"] },
              payment_method: { bsonType: ["string", "null"] },
              total_amount: { bsonType: ["double", "int", "null"] },
              notes: { bsonType: ["string", "null"] },
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
    const salesCollection = db.collection("sales");
    const existingIndexes = await salesCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { warehouse_id: 1 }, name: "warehouse_id_1" }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await salesCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("sales").drop();
  }
};
