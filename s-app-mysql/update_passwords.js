const mysql = require('mysql2/promise');

const config = {
  host: '195.35.53.6',
  port: 3306,
  user: 'u816302701_virtual',
  password: 'Vir007tu@l!',
  database: 'u816302701_standario2025'
};

async function updatePasswords() {
  let connection;
  try {
    console.log('Povezujem na MySQL bazo...');
    connection = await mysql.createConnection(config);
    console.log('Povezava uspešna!');

    // Posodobi admin@standario.com
    console.log('\nPosodabljam admin@standario.com geslo...');
    const [adminResult] = await connection.execute(
      'UPDATE profiles SET password_hash = ? WHERE email = ?',
      ['a6286dbfc32619dd328c47d1fd343ef8fc0fb0e1001ea844647e24c7a8cd3469', 'admin@standario.com']
    );
    console.log(`Posodobljenih admin: ${adminResult.affectedRows}`);

    // Posodobi demo@standario.com
    console.log('\nPosodabljam demo@standario.com geslo...');
    const [demoResult] = await connection.execute(
      'UPDATE profiles SET password_hash = ? WHERE email = ?',
      ['a6286dbfc32619dd328c47d1fd343ef8fc0fb0e1001ea844647e24c7a8cd3469', 'demo@standario.com']
    );
    console.log(`Posodobljenih demo: ${demoResult.affectedRows}`);

    // Preveri rezultat
    console.log('\n=== PREVERJAM STANJE UPORABNIKOV ===');
    const [users] = await connection.execute(
      'SELECT email, full_name, role, ' +
      'CASE WHEN password_hash IS NOT NULL THEN "HAS_PASSWORD" ELSE "NO_PASSWORD" END as password_status ' +
      'FROM profiles ' +
      'WHERE email IN (?, ?) ' +
      'ORDER BY email',
      ['admin@standario.com', 'demo@standario.com']
    );

    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}): ${user.password_status}`);
    });

    console.log('\n✅ Gesla uspešno posodobljena!');
    
  } catch (error) {
    console.error('❌ Napaka:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Povezava zaprta');
    }
  }
}

updatePasswords();