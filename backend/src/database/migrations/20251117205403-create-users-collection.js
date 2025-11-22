module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "username", "password", "email"],
          properties: {
            tenant_id: { bsonType: "string" },
            username: { bsonType: "string" },
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
    });

    await db.collection("users").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { tenant_id: 1, username: 1 }, unique: true },
      { key: { email: 1 }, sparse: true }
    ]);
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
