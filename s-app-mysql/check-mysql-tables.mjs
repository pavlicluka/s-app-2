import mysql from 'mysql2/promise';

const config = {
  host: '195.35.53.6',
  port: 3306,
  user: 'u816302701_virtual',
  password: 'Vir007tu@l!',
  database: 'u816302701_standario2025'
};

async function checkAllTables() {
  let connection;
  try {
    console.log('🔗 Povezovanje z MySQL bazo...');
    connection = await mysql.createConnection(config);
    console.log('✅ Povezava uspešna!\n');

    // Poišči vse tabele
    console.log('📊 PRENOS VSEH TABEL IZ SUPABASE V MYSQL\n');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      ORDER BY TABLE_NAME
    `, ['u816302701_standario2025']);
    
    console.log('📋 VSE TABELE V MYSQL BAZI:');
    console.log('=================================');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.TABLE_NAME}`);
    });
    
    console.log(`\n✅ Skupaj najdenih ${tables.length} tabel\n`);

    // Preveri SUPABASE_REFERENCE_QUEST tables
    console.log('🔍 PREVERJAM SUPABASE_REFERENCE_QUEST TABELE:\n');
    
    const neededTables = [
      'profiles', 'organizations', 'devices', 'support_ticket_management',
      'policies', 'procedures', 'procedures_documents', 'education_modules',
      'templates', 'inventory_asset_details', 'settings_advanced_config', 'ai_systems'
    ];
    
    const existingTables = tables.map(t => t.TABLE_NAME);
    
    console.log('✅ OBSTOJEČE TABELE:');
    neededTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`  ✓ ${table}`);
      } else {
        console.log(`  ❌ ${table} - NI NAJDENO`);
      }
    });

    console.log('\n📊 TABELE PO KATEGORIJAH:');
    
    // Kategoria za preverjanje
    const categories = {
      'CRITICAL': ['profiles', 'organizations'],
      'IMPORTANT': ['devices', 'support_ticket_management', 'policies', 'procedures'],
      'OPTIONAL': ['procedures_documents', 'education_modules', 'templates', 'inventory_asset_details', 'settings_advanced_config', 'ai_systems']
    };
    
    Object.entries(categories).forEach(([category, tablesList]) => {
      console.log(`\n${category}:`);
      tablesList.forEach(table => {
        const exists = existingTables.includes(table);
        console.log(`  ${exists ? '✅' : '❌'} ${table}`);
      });
    });

  } catch (error) {
    console.error('❌ Napaka:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Povezava zaprta.');
    }
  }
}

// Poženi preverjanje
checkAllTables();