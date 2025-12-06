import mysql from 'mysql2/promise';

const config = {
  host: '195.35.53.6',
  port: 3306,
  user: 'u816302701_virtual',
  password: 'Vir007tu@l!',
  database: 'u816302701_standario2025'
};

async function checkProfilesTable() {
  let connection;
  try {
    console.log('Povezovanje z MySQL bazo...');
    connection = await mysql.createConnection(config);
    console.log('Povezava uspešna!\n');

    // Preveri strukturo tabele profiles
    console.log('=== STRUKTURA TABELE profiles ===');
    const [structure] = await connection.query('DESCRIBE profiles');
    console.table(structure);

    // Preveri število zapisov
    const [countResult] = await connection.query('SELECT COUNT(*) as total FROM profiles');
    console.log(`\nŠtevilo zapisov v tabeli profiles: ${countResult[0].total}\n`);

    // Prikaži prvih 5 zapisov
    if (countResult[0].total > 0) {
      console.log('=== PRVIH 5 ZAPISOV ===');
      const [records] = await connection.query('SELECT * FROM profiles LIMIT 5');
      console.table(records);
    }

    // Preveri če obstaja povezava z users tabelo
    console.log('\n=== PREVERJAM POVEZAVO Z USERS TABELO ===');
    const [userCheck] = await connection.query(`
      SELECT p.*, u.email 
      FROM profiles p 
      LEFT JOIN users u ON p.user_id = u.id 
      LIMIT 3
    `);
    console.table(userCheck);

  } catch (error) {
    console.error('Napaka:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\nTabela profiles NE OBSTAJA v bazi!');
    }
  } finally {
    if (connection) await connection.end();
  }
}

checkProfilesTable();
