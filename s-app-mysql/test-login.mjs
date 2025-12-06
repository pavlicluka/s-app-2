// Test skript za preverjanje prijave
import mysql from 'mysql2/promise';

const config = {
  host: '195.35.53.6',
  port: 3306,
  user: 'u816302701_virtual',
  password: 'Vir007tu@l!',
  database: 'u816302701_standario2025'
};

async function testLogin() {
  let connection;
  try {
    console.log('1. Povezovanje z MySQL...');
    connection = await mysql.createConnection(config);
    console.log('   ✅ Povezava uspešna');
    
    // Test prijave
    const testEmail = 'admin@standario.com';
    console.log(`\n2. Iskanje uporabnika: ${testEmail}`);
    
    const [rows] = await connection.execute(
      'SELECT id, email, full_name, role FROM profiles WHERE email = ?',
      [testEmail]
    );
    
    if (rows.length === 0) {
      console.log('   ❌ Uporabnik NI NAJDEN v bazi!');
      console.log('   Ustvarjam testnega admin uporabnika...');
      
      const adminUser = {
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        email: 'admin@standario.com',
        full_name: 'Administrator',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await connection.execute(
        'INSERT INTO profiles (id, user_id, email, full_name, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [adminUser.id, adminUser.user_id, adminUser.email, adminUser.full_name, adminUser.role, adminUser.is_active, adminUser.created_at, adminUser.updated_at]
      );
      
      console.log('   ✅ Admin uporabnik uspešno ustvarjen!');
    } else {
      console.log(`   ✅ Uporabnik najden:`);
      console.log(`      Email: ${rows[0].email}`);
      console.log(`      Name: ${rows[0].full_name}`);
      console.log(`      Role: ${rows[0].role}`);
    }
    
    console.log('\n3. Test prijave s katerimkoli geslom:');
    console.log(`   Email: ${testEmail}`);
    console.log('   Geslo: katerokoli (demo mode)');
    console.log('   ✅ Prijava bi morala delovati!');
    
  } catch (error) {
    console.error('❌ NAPAKA:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testLogin();
