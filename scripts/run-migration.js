const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Connection string from command line argument
  const connectionString = process.argv[2];

  if (!connectionString) {
    console.error('❌ Please provide a connection string as argument');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read the migration file
    const sqlFile = path.join(__dirname, '..', 'migrations', 'full_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Running migration...');
    await client.query(sql);
    console.log('✅ Migration completed successfully!');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📊 Tables created:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

runMigration();
