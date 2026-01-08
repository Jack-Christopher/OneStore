module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "stock_adjustment_items" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("stock_adjustment_items", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "adjustment_id", "product_id", "old_quantity", "new_quantity", "difference", "created_at"],
            properties: {
              tenant_id: { bsonType: "string" },
              adjustment_id: { bsonType: "string" },
              product_id: { bsonType: "string" },
              old_quantity: { bsonType: ["double", "int", "null"] },
              new_quantity: { bsonType: ["double", "int", "null"] },
              difference: { bsonType: ["double", "int", "null"] },
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
      });
    }

    // Create indexes (idempotent - will skip if already exist)
    const itemsCollection = db.collection("stock_adjustment_items");
    const existingIndexes = await itemsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { adjustment_id: 1 }, name: "adjustment_id_1" },
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
    await db.collection("stock_adjustment_items").drop();
  }
};
