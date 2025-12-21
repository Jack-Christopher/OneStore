module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Add sub_units_per_unit field with default value of 1 to all existing products
    await db.collection("products").updateMany(
      { sub_units_per_unit: { $exists: false } },
      { $set: { sub_units_per_unit: 1 } }
    );

    // Update the collection validator to include the new field
    await db.command({
      collMod: "products",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "category_id", "unit_id", "name", "sku", "sale_price", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            category_id: { bsonType: "objectId" },
            unit_id: { bsonType: "objectId" },
            name: { bsonType: "string" },
            sku: { bsonType: "string" },
            barcode: { bsonType: ["string", "null"] },
            purchase_price: { bsonType: ["double", "int", "null"] },
            sale_price: { bsonType: ["double", "int"] },
            min_stock: { bsonType: ["double", "int", "null"] },
            max_stock: { bsonType: ["double", "int", "null"] },
            description: { bsonType: ["string", "null"] },
            sub_units_per_unit: { bsonType: ["double", "int", "null"] },
            is_active: { bsonType: "bool" },
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
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // Remove sub_units_per_unit field from all products
    await db.collection("products").updateMany(
      {},
      { $unset: { sub_units_per_unit: "" } }
    );
  }
};

