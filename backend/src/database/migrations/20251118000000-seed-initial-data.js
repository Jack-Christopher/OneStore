const bcrypt = require("bcryptjs");

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const now = new Date();

    // 1. Crear tenant inicial
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

    const newTenant = await db.collection("tenants").insertOne(tenant);

    console.log("newTenant", newTenant);

    // 2. Crear usuario admin del tenant
    const hashed = await bcrypt.hash("admin123", 10);

    const adminUser = {
      tenant_id: newTenant.insertedId.toString(),
      username: "admin",
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

    const newAdminUser = await db.collection("users").insertOne(adminUser);
    console.log("newAdminUser", newAdminUser);

    // 3. Ajustes base del tenant
    const settings = [
      {
        tenant_id: newTenant.insertedId.toString(),
        key: "currency",
        value: "PEN",
        created_at: now,
        updated_at: now,
        created_by: newAdminUser.insertedId.toString(),
        updated_by: newAdminUser.insertedId.toString()
      },
      {
        tenant_id: newTenant.insertedId.toString(),
        key: "timezone",
        value: "America/Lima",
        created_at: now,
        updated_at: now,
        created_by: newAdminUser.insertedId.toString(),
        updated_by: newAdminUser.insertedId.toString()
      },
      {
        tenant_id: newTenant.insertedId.toString(),
        key: "inventory_precision",
        value: 2,
        created_at: now,
        updated_at: now,
        created_by: newAdminUser.insertedId.toString(),
        updated_by: newAdminUser.insertedId.toString()
      }
    ];

    const newSettings = await db.collection("tenant_settings").insertMany(settings);
    console.log("newSettings", newSettings);
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
