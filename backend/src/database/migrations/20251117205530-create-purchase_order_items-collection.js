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
          required: ["tenant_id", "purchase_order_id", "product_id", "quantity", "unit_price", "subtotal", "created_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            purchase_order_id: { bsonType: "string" },
            product_id: { bsonType: "string" },
            quantity: { bsonType: ["double", "int", "null"] },
            unit_price: { bsonType: ["double", "int", "null"] },
            subtotal: { bsonType: ["double", "int", "null"] },
            received_quantity: { bsonType: ["double", "int", "null"] },
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
      await db.createCollection("purchase_order_items", validatorConfig);
    } catch (error) {
      // Collection already exists - update validator using collMod
      if (error.codeName === 'NamespaceExists' || error.code === 48 || error.message?.includes('already exists')) {
        try {
          await db.command({
            collMod: "purchase_order_items",
            ...validatorConfig
          });
        } catch (collModError) {
          console.log('Note: Could not update validator for purchase_order_items (may already be set):', collModError.message);
        }
      } else {
        throw error;
      }
    }

    // Create indexes (idempotent - will skip if already exist)
    const itemsCollection = db.collection("purchase_order_items");
    const existingIndexes = await itemsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { purchase_order_id: 1 }, name: "purchase_order_id_1" },
      { key: { product_id: 1 }, name: "product_id_1" }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await itemsCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("purchase_order_items").drop();
  }
};
