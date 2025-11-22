module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("sessions", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_id", "tenant_id", "last_activity", "created_at"],
          properties: {
            user_id: { bsonType: "string" },
            tenant_id: { bsonType: "string" },
            ip_address: { bsonType: ["string", "null"] },
            user_agent: { bsonType: ["string", "null"] },
            last_activity: { bsonType: "date" },
            expires_at: { bsonType: ["date", "null"] },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" },
            created_by: { bsonType: ["string", "null"] },
            updated_by: { bsonType: ["string", "null"] }
          }
        }
      },
      validationLevel: "moderate",
      validationAction: "warn"
    });

    await db.collection("sessions").createIndexes([
      { key: { _id: 1 } },
      { key: { user_id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { expires_at: 1 }, expireAfterSeconds: 0 }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("sessions").drop();
  }
};
