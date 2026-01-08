module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Check if collection already exists
    const collections = await db.listCollections({ name: "product_formulas" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      await db.createCollection("product_formulas", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["tenant_id", "name", "items", "reference_quantity", "reference_unit_id"],
            properties: {
              tenant_id: { bsonType: "string" },
              name: { bsonType: "string" },
              description: { bsonType: "string" },
              items: {
                bsonType: "array",
                minItems: 1,
                items: {
                  bsonType: "object",
                  required: ["product_id", "unit_id", "quantity"],
                  properties: {
                    product_id: { bsonType: "objectId" },
                    unit_id: { bsonType: "objectId" },
                    quantity: { bsonType: "number" }
                  }
                }
              },
              reference_quantity: { bsonType: "number" },
              reference_unit_id: { bsonType: "objectId" },
              is_active: { bsonType: "bool" },
              created_at: { bsonType: "date" },
              updated_at: { bsonType: "date" },
              created_by: { bsonType: "string" },
              updated_by: { bsonType: "string" }
            }
          }
        }
      });
    }

    // Create indexes (idempotent - will skip if already exist)
    const formulasCollection = db.collection("product_formulas");
    const existingIndexes = await formulasCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { name: 1, tenant_id: 1 }, name: "name_1_tenant_id_1", options: { unique: true } }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await formulasCollection.createIndex(index.key, options);
      }
    }
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection("product_formulas").drop();
  }
};
