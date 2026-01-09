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
    };

    // Try to create collection, use collMod if it already exists
    try {
      await db.createCollection("stock_adjustments", validatorConfig);
    } catch (error) {
      // Collection already exists - update validator using collMod
      if (error.codeName === 'NamespaceExists' || error.code === 48 || error.message?.includes('already exists')) {
        try {
          await db.command({
            collMod: "stock_adjustments",
            ...validatorConfig
          });
        } catch (collModError) {
          console.log('Note: Could not update validator for stock_adjustments (may already be set):', collModError.message);
        }
      } else {
        throw error;
      }
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
