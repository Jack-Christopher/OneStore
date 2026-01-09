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
    };

    // Try to create collection, use collMod if it already exists
    try {
      await db.createCollection("transfers", validatorConfig);
    } catch (error) {
      // Collection already exists - update validator using collMod
      if (error.codeName === 'NamespaceExists' || error.code === 48 || error.message?.includes('already exists')) {
        try {
          await db.command({
            collMod: "transfers",
            ...validatorConfig
          });
        } catch (collModError) {
          console.log('Note: Could not update validator for transfers (may already be set):', collModError.message);
        }
      } else {
        throw error;
      }
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
