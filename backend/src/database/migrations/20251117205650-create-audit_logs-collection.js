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
    };

    // Try to create collection, use collMod if it already exists
    try {
      await db.createCollection("audit_logs", validatorConfig);
    } catch (error) {
      // Collection already exists - update validator using collMod
      if (error.codeName === 'NamespaceExists' || error.code === 48 || error.message?.includes('already exists')) {
        try {
          await db.command({
            collMod: "audit_logs",
            ...validatorConfig
          });
        } catch (collModError) {
          console.log('Note: Could not update validator for audit_logs (may already be set):', collModError.message);
        }
      } else {
        throw error;
      }
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
