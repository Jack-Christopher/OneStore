module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "sale_items" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("sale_items", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "sale_id", "product_id", "quantity", "unit_price", "subtotal", "created_at"],
            properties: {
              tenant_id: { bsonType: "string" },
              sale_id: { bsonType: "string" },
              product_id: { bsonType: "string" },
              unit_id: { bsonType: "string" },
              quantity: { bsonType: ["double", "int", "null"] },
              unit_price: { bsonType: ["double", "int", "null"] },
              subtotal: { bsonType: ["double", "int", "null"] },
              created_at: { bsonType: "date" },
              updated_at: { bsonType: ["date", "null"] },
              created_by: { bsonType: ["string", "null"] },
              updated_by: { bsonType: ["string", "null"] }
            }
          }
        },
        validationLevel: "strict",
        validationAction: "error"
      });
    }

    // Create indexes (idempotent - will skip if already exist)
    const saleItemsCollection = db.collection("sale_items");
    const existingIndexes = await saleItemsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { sale_id: 1 }, name: "sale_id_1" },
      { key: { product_id: 1 }, name: "product_id_1" }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await saleItemsCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("sale_items").drop();
  }
};
