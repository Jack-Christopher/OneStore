module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "audit_logs" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("audit_logs", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "user_id", "action", "entity", "performed_at"],
            properties: {
              tenant_id: { bsonType: "string" },
              user_id: { bsonType: "string" },
              action: { bsonType: "string" },
              entity: { bsonType: "string" },
              entity_id: { bsonType: ["string", "null"] },
              old_data: { bsonType: ["object", "null"] },
              new_data: { bsonType: ["object", "null"] },
              performed_at: { bsonType: "date" },
              created_at: { bsonType: "date" },
              updated_at: { bsonType: "date" },
              created_by: { bsonType: ["string", "null"] },
              updated_by: { bsonType: ["string", "null"] }
            }
          }
        },
        validationLevel: "moderate",
        validationAction: "warn"
      });
    }

    // Create indexes (idempotent - will skip if already exist)
    const auditLogsCollection = db.collection("audit_logs");
    const existingIndexes = await auditLogsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { user_id: 1 }, name: "user_id_1" },
      { key: { entity: 1 }, name: "entity_1" },
      { key: { performed_at: -1 }, name: "performed_at_-1" }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await auditLogsCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("audit_logs").drop();
  }
};
