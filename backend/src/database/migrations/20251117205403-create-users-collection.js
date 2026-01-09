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
          required: ["tenant_id", "password", "email"],
          properties: {
            tenant_id: { bsonType: "string" },
            password: { bsonType: "string" },
            email: { bsonType: "string" },
            full_name: { bsonType: ["string", "null"] },
            role: { bsonType: "string", enum: ["admin", "manager", "clerk"] },
            is_active: { bsonType: "bool" },
            last_login_at: { bsonType: ["date", "null"] },
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
      await db.createCollection("users", validatorConfig);
    } catch (error) {
      // Collection already exists - update validator using collMod
      if (error.codeName === 'NamespaceExists' || error.code === 48 || error.message?.includes('already exists')) {
        try {
          await db.command({
            collMod: "users",
            ...validatorConfig
          });
        } catch (collModError) {
          console.log('Note: Could not update validator for users (may already be set):', collModError.message);
        }
      } else {
        throw error;
      }
    }

    // Create indexes (idempotent - will skip if already exist)
    const usersCollection = db.collection("users");
    const existingIndexes = await usersCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    const indexesToCreate = [
      { key: { tenant_id: 1 }, name: "tenant_id_1" },
      { key: { email: 1 }, name: "email_1", options: { sparse: true } }
    ];

    for (const index of indexesToCreate) {
      if (!indexNames.includes(index.name)) {
        const options = index.options || {};
        await usersCollection.createIndex(index.key, options);
      }
    }
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("users").drop();
  }
};
