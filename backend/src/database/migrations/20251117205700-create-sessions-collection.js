module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "sessions" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("sessions", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["user_id", "tenant_id", "last_activity", "created_at"],
            properties: {
              user_id: { bsonType: "string" },
              tenant_id: { bsonType: "string" },
              ip_address: { bsonType: ["string", "null"] },
              user_agent: { bsonType: ["string", "null"] },
              last_activity: { bsonType: "date" },
              expires_at: { bsonType: ["date", "null"] },
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
    const sessionsCollection = db.collection("sessions");
    const existingIndexes = await sessionsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { user_id: 1 }, name: "user_id_1" },
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { expires_at: 1 }, name: "expires_at_1", options: { expireAfterSeconds: 0 } }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await sessionsCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("sessions").drop();
  }
};
