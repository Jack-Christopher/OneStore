module.exports = {
  async up(db) {
    await db.collection("exchange_rates").createIndex({ rate_date: 1 }, { unique: true, name: "rate_date_1" });
    await db.collection("cost_layers").createIndex(
      { tenant_id: 1, product_id: 1, warehouse_id: 1, received_at: 1 },
      { name: "tenant_product_warehouse_received" }
    );
    await db.collection("ruc_cache").createIndex({ ruc: 1 }, { unique: true, name: "ruc_1" });
    await db.collection("counters").createIndex({ tenant_id: 1, key: 1 }, { unique: true, name: "tenant_key_1" });
  },

  async down(db) {
    const drop = async (collection, index) => {
      try {
        await db.collection(collection).dropIndex(index);
      } catch (error) {
        console.log(`Note: could not drop ${collection}.${index}`);
      }
    };
    await drop("exchange_rates", "rate_date_1");
    await drop("cost_layers", "tenant_product_warehouse_received");
    await drop("ruc_cache", "ruc_1");
    await drop("counters", "tenant_key_1");
  }
};
