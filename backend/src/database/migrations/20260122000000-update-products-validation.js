module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Update the collection validator to make only name and supplier_id required (along with tenant_id, created_at, updated_at)
    // All other fields (category_id, unit_id, sku, sale_price, etc.) are now optional
    await db.command({
      collMod: "products",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tenant_id", "name", "created_at", "updated_at"],
          properties: {
            tenant_id: { bsonType: "string" },
            category_id: { bsonType: ["objectId", "null"] },
            unit_id: { bsonType: ["objectId", "null"] },
            supplier_id: { bsonType: ["objectId", "null"] },
            name: { bsonType: "string" },
            sku: { bsonType: ["string", "null"] },
            barcode: { bsonType: ["string", "null"] },
            purchase_price: { bsonType: ["double", "int", "null"] },
            sale_price: { bsonType: ["double", "int", "null"] },
            min_stock: { bsonType: ["double", "int", "null"] },
            max_stock: { bsonType: ["double", "int", "null"] },
            description: { bsonType: ["string", "null"] },
            sub_units_per_unit: { bsonType: ["double", "int", "null"] },
            is_active: { bsonType: ["bool", "null"] },
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

    // Change unique index from tenant_id + sku to tenant_id + name
    const productsCollection = db.collection("products");
    const existingIndexes = await productsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    // Drop the old tenant_id_sku unique indexes if they exist
    const oldIndexNames = ["tenant_id_1_sku_1", "tenant_id_1_sku_1_sparse"];
    for (const oldIndexName of oldIndexNames) {
      if (indexNames.includes(oldIndexName)) {
        try {
          await productsCollection.dropIndex(oldIndexName);
        } catch (error) {
          const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
          console.log(`Note: Could not drop old index ${oldIndexName} (may not exist):`, errMsg);
        }
      }
    }

    // Create the new unique index on tenant_id + name
    const newIndexName = "tenant_id_1_name_1";
    if (!indexNames.includes(newIndexName)) {
      try {
        await productsCollection.createIndex(
          { tenant_id: 1, name: 1 },
          {
            name: newIndexName,
            unique: true
          }
        );
      } catch (error) {
        const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
        console.log('Note: Could not create tenant_id + name unique index (may already exist):', errMsg);
      }
    }

    // Create a non-unique sparse index on sku for faster lookups (optional field)
    const skuIndexName = "sku_1_sparse";
    if (!indexNames.includes(skuIndexName)) {
      try {
        await productsCollection.createIndex(
          { sku: 1 },
          {
            name: skuIndexName,
            sparse: true
          }
        );
      } catch (error) {
        const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
        console.log('Note: Could not create sku sparse index (may already exist):', errMsg);
      }
    }

    // Also ensure supplier_id index exists for better query performance
    const supplierIndexName = "supplier_id_1";
    if (!indexNames.includes(supplierIndexName)) {
      try {
        await productsCollection.createIndex(
          { supplier_id: 1 },
          { name: supplierIndexName }
        );
      } catch (error) {
        const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
        console.log('Note: Could not create supplier_id index (may already exist):', errMsg);
      }
    }
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // Revert to the previous validator state (with category_id, unit_id, sku, sale_price required)
    // Note: supplier_id is kept as optional in down() to avoid breaking existing data
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
            supplier_id: { bsonType: ["objectId", "null"] },
            name: { bsonType: "string" },
            sku: { bsonType: "string" },
            barcode: { bsonType: ["string", "null"] },
            purchase_price: { bsonType: ["double", "int", "null"] },
            sale_price: { bsonType: ["double", "int", "null"] },
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

    // Revert index changes - restore tenant_id + sku unique index
    const productsCollection = db.collection("products");
    const existingIndexes = await productsCollection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    // Drop the tenant_id + name unique index
    const nameIndexName = "tenant_id_1_name_1";
    if (indexNames.includes(nameIndexName)) {
      try {
        await productsCollection.dropIndex(nameIndexName);
      } catch (error) {
        const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
        console.log('Note: Could not drop tenant_id + name index:', errMsg);
      }
    }

    // Drop the sku sparse index
    const skuIndexName = "sku_1_sparse";
    if (indexNames.includes(skuIndexName)) {
      try {
        await productsCollection.dropIndex(skuIndexName);
      } catch (error) {
        const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
        console.log('Note: Could not drop sku sparse index:', errMsg);
      }
    }

    // Recreate the original tenant_id + sku unique index
    const oldIndexName = "tenant_id_1_sku_1";
    if (!indexNames.includes(oldIndexName)) {
      try {
        await productsCollection.createIndex(
          { tenant_id: 1, sku: 1 },
          { name: oldIndexName, unique: true }
        );
      } catch (error) {
        const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
        console.log('Note: Could not recreate original tenant_id + sku index:', errMsg);
      }
    }

    // Drop supplier_id index if it exists
    const supplierIndexName = "supplier_id_1";
    if (indexNames.includes(supplierIndexName)) {
      try {
        await productsCollection.dropIndex(supplierIndexName);
      } catch (error) {
        const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
        console.log('Note: Could not drop supplier_id index:', errMsg);
      }
    }
  }
};

