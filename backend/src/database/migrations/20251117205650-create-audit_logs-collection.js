module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection("audit_logs", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "user_id", "action", "entity", "performed_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            user_id: { bsonType: "string" },
            action: { bsonType: "string" },
            entity: { bsonType: "string" },
            entity_id: { bsonType: ["string", "null"] },
            old_data: { bsonType: ["object", "null"] },
            new_data: { bsonType: ["object", "null"] },
            performed_at: { bsonType: "date" },
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

    await db.collection("audit_logs").createIndexes([
      { key: { _id: 1 } },
      { key: { tenant_id: 1 } },
      { key: { user_id: 1 } },
      { key: { entity: 1 } },
      { key: { performed_at: -1 } }
    ]);
  },

  /**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
  async down(db, client) {
    await db.collection("audit_logs").drop();
  }
};
