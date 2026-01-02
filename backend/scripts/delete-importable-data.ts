export { }; // Empty export to force module scope

/**
 * Script to delete all importable data for a specific tenant
 * 
 * Usage: 
 *   npm run delete:importable -- --email user@example.com --confirm
 * 
 * Optional: Override MongoDB connection (for local execution):
 *   npm run delete:importable -- --email user@example.com --mongo-uri mongodb://localhost:27017/onestore --confirm
 * 
 * Importable collections based on imports.types.ts and billing imports:
 * - sales
 * - products
 * - categories
 * - customers
 * - suppliers
 * - warehouses
 * - purchase_orders
 * - stock_movements
 * - warehouse_products
 * - units_of_measure
 * - product_formulas
 * - sale_items
 * - invoices
 * - sale_tickets
 * - credit_notes
 * - debit_notes
 * - sale_notes
 * - proformas
 * - billing_document_items
 */

const mongoose = require("mongoose");
const { dbUrl } = require("../src/config/env");
const User = require("../src/database/models/User");

// Map importable modules to their MongoDB collection names
const IMPORTABLE_COLLECTIONS = [
  'sales',
  'products',
  'categories',
  'customers',
  'suppliers',
  'warehouses',
  'purchase_orders',
  'stock_movements',
  'warehouse_products',
  'units_of_measure',
  'product_formulas',
  'sale_items',
  'invoices',
  'sale_tickets',
  'credit_notes',
  'debit_notes',
  'sale_notes',
  'proformas',
  'billing_document_items',
];

function parseArgs() {
  const args = process.argv.slice(2);
  const emailIndex = args.indexOf('--email');
  const mongoUriIndex = args.indexOf('--mongo-uri');
  const confirmFlag = args.includes('--confirm');

  let email: string | null = null;
  if (emailIndex !== -1 && args[emailIndex + 1]) {
    email = args[emailIndex + 1];
  }

  let mongoUri: string | null = null;
  if (mongoUriIndex !== -1 && args[mongoUriIndex + 1]) {
    mongoUri = args[mongoUriIndex + 1];
  }

  return { email, mongoUri, confirmFlag };
}

async function deleteImportableData() {
  try {
    // Parse command line arguments
    const { email, mongoUri, confirmFlag } = parseArgs();

    if (!email) {
      console.error('❌ Error: Email is required');
      console.log('\nUsage:');
      console.log('  npm run delete:importable -- --email user@example.com --confirm');
      console.log('\nOptional: Override MongoDB connection string');
      console.log('  npm run delete:importable -- --email user@example.com --mongo-uri mongodb://localhost:27017/onestore --confirm');
      process.exit(1);
    }

    // Determine which MongoDB URL to use
    const databaseUrl = mongoUri || process.env.MONGO_URI || dbUrl;

    // Check if URL contains "db:" (Docker hostname) and suggest localhost alternative
    if (databaseUrl.includes('://db:')) {
      console.warn('⚠️  WARNING: Database URL contains "db:" hostname (Docker service name)');
      console.warn('   This will only work inside Docker. For local execution, use:');
      console.warn(`   --mongo-uri mongodb://localhost:27017/onestore`);
      console.warn('');
    }

    if (!confirmFlag) {
      console.log('⚠️  WARNING: This script will DELETE ALL IMPORTABLE DATA for the tenant associated with this email:');
      console.log(`   Email: ${email}`);
      console.log(`   Database: ${databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide password if present
      console.log('\nThe following collections will be affected:');
      IMPORTABLE_COLLECTIONS.forEach(col => console.log(`   - ${col}`));
      console.log('\nThis action cannot be undone!\n');
      console.log('To proceed, run with --confirm flag:');
      console.log(`  npm run delete:importable -- --email ${email} --confirm`);
      if (databaseUrl.includes('://db:')) {
        console.log('\nOr override database URL for local execution:');
        console.log(`  npm run delete:importable -- --email ${email} --mongo-uri mongodb://localhost:27017/onestore --confirm`);
      }
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    console.log(`Database URL: ${databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide password if present
    await mongoose.connect(databaseUrl);
    console.log('Connected successfully\n');

    // Find user by email
    console.log(`Looking up user with email: ${email}...`);
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.error(`❌ Error: User with email '${email}' not found`);
      await mongoose.connection.close();
      process.exit(1);
    }

    const tenantId = user.tenant_id;

    if (!tenantId || tenantId === 'orphan') {
      console.error(`❌ Error: User has invalid tenant_id: '${tenantId}'`);
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`✓ Found user: ${user.full_name || user.email}`);
    console.log(`✓ Tenant ID: ${tenantId}\n`);

    console.log('⚠️  WARNING: Deleting all importable data for this tenant...\n');

    const db = mongoose.connection.db;
    const results: { collection: string; deletedCount: number }[] = [];

    for (const collectionName of IMPORTABLE_COLLECTIONS) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments({ tenant_id: tenantId });

        if (count > 0) {
          const result = await collection.deleteMany({ tenant_id: tenantId });
          results.push({
            collection: collectionName,
            deletedCount: result.deletedCount || 0
          });
          console.log(`✓ Deleted ${result.deletedCount} documents from '${collectionName}' (tenant: ${tenantId})`);
        } else {
          console.log(`○ Collection '${collectionName}' has no data for this tenant`);
        }
      } catch (error: any) {
        console.error(`✗ Error deleting from '${collectionName}': ${error.message}`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Tenant ID: ${tenantId}`);
    console.log(`User Email: ${email}`);
    if (results.length === 0) {
      console.log('No data was deleted (all collections were empty for this tenant)');
    } else {
      const totalDeleted = results.reduce((sum, r) => sum + r.deletedCount, 0);
      console.log(`Total documents deleted: ${totalDeleted}`);
      results.forEach(r => {
        console.log(`  - ${r.collection}: ${r.deletedCount} documents`);
      });
    }

    await mongoose.connection.close();
    console.log('\nConnection closed');
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
deleteImportableData();

