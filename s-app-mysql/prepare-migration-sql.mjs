import mysql from 'mysql2/promise';

const mysqlConfig = {
  host: '195.35.53.6',
  port: 3306,
  user: 'u816302701_virtual',
  password: 'Vir007tu@l!',
  database: 'u816302701_standario2025'
};

console.log('=== PRIPRAVA SQL STAVKOV ZA MIGRACIJO ===\n');

async function prepareMigration() {
  let connection;
  
  try {
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ MySQL povezava uspešna\n');
    
    const [profiles] = await connection.query('SELECT * FROM profiles');
    console.log(`Najdenih ${profiles.length} profilov za migracijo\n`);
    
    console.log('=== PODATKI ZA ROČNO VNOS ===\n');
    
    profiles.forEach((profile, index) => {
      console.log(`Profile ${index + 1}:`);
      console.log(`  Email: ${profile.email}`);
      console.log(`  Name: ${profile.full_name || 'N/A'}`);
      console.log(`  Role: ${profile.role || 'user'}`);
      console.log(`  Org ID: ${profile.organization_id || 'N/A'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Napaka:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

prepareMigration();
