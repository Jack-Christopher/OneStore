module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "purchase_orders" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("purchase_orders", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "supplier_id", "warehouse_id", "user_id", "status", "total_amount", "created_at", "updated_at"],
            properties: {
              tenant_id: { bsonType: "string" },
              supplier_id: { bsonType: "string" },
              warehouse_id: { bsonType: "string" },
              user_id: { bsonType: "string" },
              status: { bsonType: "string", enum: ["pending", "received", "canceled"] },
              reference_number: { bsonType: ["string", "null"] },
              total_amount: { bsonType: ["double", "int", "null"] },
              notes: { bsonType: ["string", "null"] },
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
      });
    }

    // Create indexes (idempotent - will skip if already exist)
    const purchaseOrdersCollection = db.collection("purchase_orders");
    const existingIndexes = await purchaseOrdersCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { supplier_id: 1 }, name: "supplier_id_1" },
      { key: { warehouse_id: 1 }, name: "warehouse_id_1" },
      { key: { reference_number: 1 }, name: "reference_number_1", options: { sparse: true } }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await purchaseOrdersCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("purchase_orders").drop();
  }
};
