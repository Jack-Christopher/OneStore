const bcrypt = require("bcryptjs");

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const now = new Date();

    // 1. Check if default tenant already exists (idempotent)
    let existingTenant = await db.collection("tenants").findOne({ email: "admin@example.com" });

    let tenantId;
    if (!existingTenant) {
      // Crear tenant inicial
      const tenant = {
        name: "Default Tenant",
        document_number: "00000000000",
        address: "N/A",
        phone: "N/A",
        email: "admin@example.com",
        is_active: true,
        created_at: now,
        updated_at: now,
        created_by: "system",
        updated_by: "system"
      };

      const newTenantResult = await db.collection("tenants").insertOne(tenant);
      tenantId = newTenantResult.insertedId.toString();
      console.log("newTenant", newTenantResult);
    } else {
      tenantId = existingTenant._id.toString();
      console.log("Tenant already exists, using existing tenant");
    }

    // 2. Check if admin user already exists (idempotent)
    let existingAdminUser = await db.collection("users").findOne({
      tenant_id: tenantId,
      email: "admin@example.com"
    });

    let adminUserId;
    if (!existingAdminUser) {
      // Crear usuario admin del tenant
      const hashed = await bcrypt.hash("admin123", 10);

      const adminUser = {
        tenant_id: tenantId,
        password: hashed,
        email: "admin@example.com",
        full_name: "System Administrator",
        role: "admin",
        is_active: true,
        last_login_at: null,
        metadata: null,
        created_by: "system",
        updated_by: "system"
      };

      const newAdminUserResult = await db.collection("users").insertOne(adminUser);
      adminUserId = newAdminUserResult.insertedId.toString();
      console.log("newAdminUser", newAdminUserResult);
    } else {
      adminUserId = existingAdminUser._id.toString();
      console.log("Admin user already exists, using existing user");
    }

    // 3. Check and create settings only if they don't exist (idempotent)
    const settingsKeys = ["currency", "timezone", "inventory_precision"];
    const existingSettings = await db.collection("tenant_settings")
      .find({ tenant_id: tenantId, key: { $in: settingsKeys } })
      .toArray();

    const existingKeys = existingSettings.map(s => s.key);
    const settingsToCreate = [];

    if (!existingKeys.includes("currency")) {
      settingsToCreate.push({
        tenant_id: tenantId,
        key: "currency",
        value: "PEN",
        created_at: now,
        updated_at: now,
        created_by: adminUserId,
        updated_by: adminUserId
      });
    }

    if (!existingKeys.includes("timezone")) {
      settingsToCreate.push({
        tenant_id: tenantId,
        key: "timezone",
        value: "America/Lima",
        created_at: now,
        updated_at: now,
        created_by: adminUserId,
        updated_by: adminUserId
      });
    }

    if (!existingKeys.includes("inventory_precision")) {
      settingsToCreate.push({
        tenant_id: tenantId,
        key: "inventory_precision",
        value: 2,
        created_at: now,
        updated_at: now,
        created_by: adminUserId,
        updated_by: adminUserId
      });
    }

    if (settingsToCreate.length > 0) {
      const newSettings = await db.collection("tenant_settings").insertMany(settingsToCreate);
      console.log("newSettings", newSettings);
    } else {
      console.log("All settings already exist, skipping creation");
    }
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    const tenantId = await db.collection("tenants").findOne({ email: "admin@example.com" })
      .then((tenant) => tenant?._id);
    await db.collection("tenant_settings").deleteMany({ tenant_id: tenantId?.toString() });
    await db.collection("users").deleteOne({ tenant_id: tenantId?.toString() });
    await db.collection("tenants").deleteOne({ _id: tenantId });
  }
};
