module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const now = new Date();

    const units = [
      // Unidades básicas
      {
        tenant_id: "default",
        code: "UN",
        name: "Unidad",
        description: "Cantidad individual o pieza",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },
      {
        tenant_id: "default",
        code: "KG",
        name: "Kilogramo",
        description: "Masa equivalente a 1 kilogramo",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },
      {
        tenant_id: "default",
        code: "G",
        name: "Gramo",
        description: "Masa equivalente a 1 gramo",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },
      {
        tenant_id: "default",
        code: "MG",
        name: "Miligramo",
        description: "Masa equivalente a 1 miligramo",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },

      // Volumen
      {
        tenant_id: "default",
        code: "L",
        name: "Litro",
        description: "Volumen equivalente a 1 litro",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },
      {
        tenant_id: "default",
        code: "ML",
        name: "Mililitro",
        description: "Volumen equivalente a 1 mililitro",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },

      // Longitud
      {
        tenant_id: "default",
        code: "M",
        name: "Metro",
        description: "Unidad de longitud de 1 metro",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },
      {
        tenant_id: "default",
        code: "CM",
        name: "Centímetro",
        description: "Unidad de longitud de 1 centímetro",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },
      {
        tenant_id: "default",
        code: "MM",
        name: "Milímetro",
        description: "Unidad de longitud de 1 milímetro",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },

      // Otros comunes en almacén
      {
        tenant_id: "default",
        code: "PAQ",
        name: "Paquete",
        description: "Paquete con cantidad variable",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },
      {
        tenant_id: "default",
        code: "CAJ",
        name: "Caja",
        description: "Caja que agrupa productos",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },
      {
        tenant_id: "default",
        code: "BOL",
        name: "Bolsa",
        description: "Bolsa que contiene una cantidad de producto",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },
      {
        tenant_id: "default",
        code: "PAR",
        name: "Par",
        description: "Unidad compuesta por dos piezas",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      },
      {
        tenant_id: "default",
        code: "DOC",
        name: "Docena",
        description: "Conjunto de 12 unidades",
        created_at: now,
        updated_at: now,
        created_by: "System",
        updated_by: "System"
      }
    ];

    await db.collection("units_of_measure").insertMany(units);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection("units_of_measure").deleteMany({ tenant_id: "default" });
  }
};
