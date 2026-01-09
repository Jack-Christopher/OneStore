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
          required: ["name", "created_at", "updated_at"],
          properties: {
            name: { bsonType: "string", description: "display name" },
            legal_name: { bsonType: ["string", "null"] },
            document_type: { bsonType: ["string", "null"] },
            document_number: { bsonType: ["string", "null"] },
            address: { bsonType: ["string", "null"] },
            phone: { bsonType: ["string", "null"] },
            email: { bsonType: ["string", "null"] },
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
      await db.createCollection("tenants", validatorConfig);
    } catch (error) {
      // Collection already exists - update validator using collMod
      if (error.codeName === 'NamespaceExists' || error.code === 48 || error.message?.includes('already exists')) {
        try {
          await db.command({
            collMod: "tenants",
            ...validatorConfig
          });
        } catch (collModError) {
          // If collMod fails, it might be because validator is already set or other reason
          // Log but don't fail - collection exists and indexes will be created
          console.log('Note: Could not update validator for tenants (may already be set):', collModError.message);
        }
      } else {
        throw error;
      }
    }

    // Create indexes (idempotent - will skip if already exist)
    const tenantsCollection = db.collection("tenants");
    const existingIndexes = await tenantsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { name: 1 }, name: "name_1" },
      { key: { document_number: 1 }, name: "document_number_1", options: { sparse: true, unique: true } }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await tenantsCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("tenants").drop();
  }
};
