module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "transfer_items" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("transfer_items", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "transfer_id", "product_id", "quantity", "created_at"],
            properties: {
              tenant_id: { bsonType: "string" },
              transfer_id: { bsonType: "string" },
              product_id: { bsonType: "string" },
              quantity: { bsonType: ["double", "int", "null"] },
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
    const itemsCollection = db.collection("transfer_items");
    const existingIndexes = await itemsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { transfer_id: 1 }, name: "transfer_id_1" },
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
    await db.collection("transfer_items").drop();
  }
};
