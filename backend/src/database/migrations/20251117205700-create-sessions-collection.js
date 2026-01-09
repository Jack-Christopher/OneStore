module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const validatorConfig = {
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
    };

    // Try to create collection, use collMod if it already exists
    try {
      await db.createCollection("sessions", validatorConfig);
    } catch (error) {
      // Collection already exists - update validator using collMod
      if (error.codeName === 'NamespaceExists' || error.code === 48 || error.message?.includes('already exists')) {
        try {
          await db.command({
            collMod: "sessions",
            ...validatorConfig
          });
        } catch (collModError) {
          console.log('Note: Could not update validator for sessions (may already be set):', collModError.message);
        }
      } else {
        throw error;
      }
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
