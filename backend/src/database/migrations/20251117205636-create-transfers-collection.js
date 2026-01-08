module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "transfers" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("transfers", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "from_warehouse_id", "to_warehouse_id", "user_id", "status", "created_at", "updated_at"],
            properties: {
              tenant_id: { bsonType: "string" },
              from_warehouse_id: { bsonType: "string" },
              to_warehouse_id: { bsonType: "string" },
              user_id: { bsonType: "string" },
              status: { bsonType: "string", enum: ["pending", "completed", "canceled"] },
              reference: { bsonType: ["string", "null"] },
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
    const transfersCollection = db.collection("transfers");
    const existingIndexes = await transfersCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { from_warehouse_id: 1 }, name: "from_warehouse_id_1" },
      { key: { to_warehouse_id: 1 }, name: "to_warehouse_id_1" }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await transfersCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("transfers").drop();
  }
};
