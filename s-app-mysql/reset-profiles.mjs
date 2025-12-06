import mysql from 'mysql2/promise';

const config = {
  host: '195.35.53.6',
  port: 3306,
  user: 'u816302701_virtual',
  password: 'Vir007tu@l!',
  database: 'u816302701_standario2025'
};

async function resetProfilesTable() {
  let connection;
  try {
    console.log('🔗 Povezovanje z MySQL bazo...');
    connection = await mysql.createConnection(config);
    console.log('✅ Povezava uspešna!\n');

    // 1. Odstrani vse zapise iz tabele profiles
    console.log('🗑️ Odstranjujem vse zapise iz tabele profiles...');
    const [deleteResult] = await connection.execute('DELETE FROM profiles');
    console.log(`✅ Odstranjenih ${deleteResult.affectedRows} zapisov\n`);

    // 2. Novo geslo
    const newPassword = 'Demo2025!';
    console.log(`🔐 Novo geslo: ${newPassword}\n`);

    // 3. Vstavi demo uporabnika z vlogo "user"
    const demoUser = {
      email: 'demo@standario.com',
      full_name: 'Demo Uporabnik',
      role: 'user',
      is_active: 1
    };
    
    console.log('➕ Vstavljam demo@standario.com z vlogo "user"...');
    const [demoResult] = await connection.execute(
      'INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())',
      [demoUser.email, demoUser.full_name, demoUser.role, demoUser.is_active]
    );
    console.log(`✅ Demo uporabnik vstavljen (ID: ${demoResult.insertId})\n`);

    // 4. Vstavi admin uporabnika z vlogo "superadmin"
    const adminUser = {
      email: 'admin@standario.com',
      full_name: 'Administrator',
      role: 'superadmin',
      is_active: 1
    };
    
    console.log('➕ Vstavljam admin@standario.com z vlogo "superadmin"...');
    const [adminResult] = await connection.execute(
      'INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())',
      [adminUser.email, adminUser.full_name, adminUser.role, adminUser.is_active]
    );
    console.log(`✅ Admin uporabnik vstavljen (ID: ${adminResult.insertId})\n`);

    // 5. Preveri končno stanje
    console.log('📊 KONČNO STANJE TABELE PROFILES:');
    const [finalProfiles] = await connection.execute('SELECT id, email, full_name, role, is_active FROM profiles');
    console.table(finalProfiles);

    console.log('\n✅ Uspešno ponastavljena tabela profiles!');
    console.log('👥 Uporabniki:');
    console.log('  📧 demo@standario.com - vloga: user');
    console.log('  📧 admin@standario.com - vloga: superadmin');
    console.log(`🔐 Geslo za oba uporabnika: ${newPassword}`);

  } catch (error) {
    console.error('❌ Napaka:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Povezava zaprta.');
    }
  }
}

// Poženi reset
resetProfilesTable();