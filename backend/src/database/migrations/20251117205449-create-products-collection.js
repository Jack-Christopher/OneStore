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
          required: ["tenant_id", "name", "sku", "sale_price", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            category_id: { bsonType: ["string", "null"] },
            unit_id: { bsonType: ["string", "null"] },
            name: { bsonType: "string" },
            sku: { bsonType: "string" },
            barcode: { bsonType: ["string", "null"] },
            purchase_price: { bsonType: ["double", "int", "null"] },
            sale_price: { bsonType: ["double", "int", "null"] },
            min_stock: { bsonType: ["int", "null"] },
            max_stock: { bsonType: ["int", "null"] },
            description: { bsonType: ["string", "null"] },
            is_active: { bsonType: "bool" },
            metadata: { bsonType: ["object", "null"] },
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
      await db.createCollection("products", validatorConfig);
    } catch (error) {
      // Collection already exists - update validator using collMod
      if (error.codeName === 'NamespaceExists' || error.code === 48 || error.message?.includes('already exists')) {
        try {
          await db.command({
            collMod: "products",
            ...validatorConfig
          });
        } catch (collModError) {
          console.log('Note: Could not update validator for products (may already be set):', collModError.message);
        }
      } else {
        throw error;
      }
    }

    // Create indexes (idempotent - will skip if already exist)
    const productsCollection = db.collection("products");
    const existingIndexes = await productsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { category_id: 1 }, name: "category_id_1" },
      { key: { unit_id: 1 }, name: "unit_id_1" },
      { key: { tenant_id: 1, sku: 1 }, name: "tenant_id_1_sku_1", options: { unique: true } },
      { key: { barcode: 1 }, name: "barcode_1", options: { sparse: true } }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await productsCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("products").drop();
  }
};
