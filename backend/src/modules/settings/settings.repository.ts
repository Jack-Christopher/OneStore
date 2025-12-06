const TenantSetting = require("../../database/models/TenantSetting");
const User = require("../../database/models/User");

module.exports = {
  async findAll(user_id: string) {
    const user = await User.findOne({ _id: user_id }).exec();
    if (!user || user.tenant_id === "orphan") return [];
    
    const settings = await TenantSetting.find({ tenant_id: user.tenant_id }).exec();
    return settings;
  },

  async findByKey(user_id: string, key: string) {
    const user = await User.findOne({ _id: user_id }).exec();
    if (!user || user.tenant_id === "orphan") return null;
    
    return TenantSetting.findOne({ tenant_id: user.tenant_id, key }).exec();
  },

  async createOrUpdate(user_id: string, key: string, value: any, description?: string) {
    const user = await User.findOne({ _id: user_id }).exec();
    if (!user || user.tenant_id === "orphan") {
      throw new Error("User not found or orphan tenant");
    }

    const setting = await TenantSetting.findOneAndUpdate(
      { tenant_id: user.tenant_id, key },
      {
        tenant_id: user.tenant_id,
        key,
        value,
        description,
        updated_by: user_id
      },
      { upsert: true, new: true }
    ).exec();

    return setting;
  },

  async bulkUpdate(user_id: string, updates: Record<string, any>) {
    const user = await User.findOne({ _id: user_id }).exec();
    if (!user || user.tenant_id === "orphan") {
      throw new Error("User not found or orphan tenant");
    }

    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      const setting = await TenantSetting.findOneAndUpdate(
        { tenant_id: user.tenant_id, key },
        {
          tenant_id: user.tenant_id,
          key,
          value,
          updated_by: user_id
        },
        { upsert: true, new: true }
      ).exec();
      results.push(setting);
    }

    return results;
  }
};

