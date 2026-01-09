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
          required: ["tenant_id", "key", "value", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            key: { bsonType: "string" },
            value: { bsonType: ["object", "array", "string", "number", "null"] },
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
    };

    // Try to create collection, use collMod if it already exists
    try {
      await db.createCollection("tenant_settings", validatorConfig);
    } catch (error) {
      // Collection already exists - update validator using collMod
      if (error.codeName === 'NamespaceExists' || error.code === 48 || error.message?.includes('already exists')) {
        try {
          await db.command({
            collMod: "tenant_settings",
            ...validatorConfig
          });
        } catch (collModError) {
          console.log('Note: Could not update validator for tenant_settings (may already be set):', collModError.message);
        }
      } else {
        throw error;
      }
    }

    // Create indexes (idempotent - will skip if already exist)
    const settingsCollection = db.collection("tenant_settings");
    const existingIndexes = await settingsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { tenant_id: 1, key: 1 }, name: "tenant_id_1_key_1", options: { unique: true } }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await settingsCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("tenant_settings").drop();
  }
};
