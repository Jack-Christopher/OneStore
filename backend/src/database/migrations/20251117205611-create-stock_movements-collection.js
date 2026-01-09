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
          required: ["tenant_id", "warehouse_id", "product_id", "movement_type", "quantity", "created_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            warehouse_id: { bsonType: "string" },
            product_id: { bsonType: "string" },
            movement_type: { bsonType: "string", enum: ["purchase", "sale", "adjustment_in", "adjustment_out", "transfer_in", "transfer_out"] },
            quantity: { bsonType: ["double", "int", "null"] },
            related_id: { bsonType: ["string", "null"] },
            comment: { bsonType: ["string", "null"] },
            metadata: { bsonType: ["object", "null"] },
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
      await db.createCollection("stock_movements", validatorConfig);
    } catch (error) {
      // Collection already exists - update validator using collMod
      if (error.codeName === 'NamespaceExists' || error.code === 48 || error.message?.includes('already exists')) {
        try {
          await db.command({
            collMod: "stock_movements",
            ...validatorConfig
          });
        } catch (collModError) {
          console.log('Note: Could not update validator for stock_movements (may already be set):', collModError.message);
        }
      } else {
        throw error;
      }
    }

    // Create indexes (idempotent - will skip if already exist)
    const stockMovementsCollection = db.collection("stock_movements");
    const existingIndexes = await stockMovementsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { warehouse_id: 1 }, name: "warehouse_id_1" },
      { key: { product_id: 1 }, name: "product_id_1" },
      { key: { movement_type: 1 }, name: "movement_type_1" },
      { key: { created_at: -1 }, name: "created_at_-1" }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await stockMovementsCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("stock_movements").drop();
  }
};
