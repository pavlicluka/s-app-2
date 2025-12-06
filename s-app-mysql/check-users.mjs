import mysql from 'mysql2/promise';

const config = {
  host: '195.35.53.6',
  port: 3306,
  user: 'u816302701_virtual',
  password: 'Vir007tu@l!',
  database: 'u816302701_standario2025'
};

async function checkUsers() {
  let connection;
  try {
    console.log('Connecting to MySQL...');
    connection = await mysql.createConnection(config);
    console.log('Connected successfully!');
    
    // Check existing users
    const [rows] = await connection.execute('SELECT id, email, full_name, role FROM profiles LIMIT 10');
    
    console.log('\n=== OBSTOJEČI UPORABNIKI ===');
    if (rows.length === 0) {
      console.log('Ni uporabnikov v bazi.');
      
      // Create a test user
      console.log('\nUstvarjam testnega uporabnika...');
      const testUser = {
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        email: 'test@standario.si',
        full_name: 'Test Uporabnik',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await connection.execute(
        'INSERT INTO profiles (id, user_id, email, full_name, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [testUser.id, testUser.user_id, testUser.email, testUser.full_name, testUser.role, testUser.is_active, testUser.created_at, testUser.updated_at]
      );
      
      console.log('✅ Testni uporabnik ustvarjen:');
      console.log('  Email: test@standario.si');
      console.log('  Geslo: katerokoli (za demo)');
      console.log('  Role: admin');
    } else {
      rows.forEach((row, index) => {
        console.log(`${index + 1}. Email: ${row.email}, Name: ${row.full_name}, Role: ${row.role}`);
      });
      
      console.log('\n✅ Za prijavo uporabite kateregakoli od zgornjih emailov in katerokoli geslo (demo mode)');
    }
    
  } catch (error) {
    console.error('❌ Napaka:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsers();
