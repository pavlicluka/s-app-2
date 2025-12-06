import mysql from 'mysql2/promise';

async function createAdminUser() {
  try {
    const connection = await mysql.createConnection({
      host: '195.35.53.6',
      port: 3306,
      user: 'u816302701_virtual',
      password: 'Vir007tu@l!',
      database: 'u816302701_standario2025'
    });

    console.log('Povezan na MySQL bazo');

    // Preveri če admin obstaja
    const [existing] = await connection.execute(
      'SELECT id, email, full_name, role FROM profiles WHERE email = ?',
      ['admin@standario.com']
    );

    if (existing.length > 0) {
      console.log('\nAdmin uporabnik ze obstaja:');
      console.log(existing[0]);
    } else {
      console.log('\nUstvarjam admin uporabnika...');
      
      // Ustvari admin uporabnika
      await connection.execute(
        `INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        ['admin-user-001', 'admin@standario.com', 'Administrator', 'super_admin', 1]
      );

      console.log('Admin uporabnik uspesno ustvarjen!');
      
      // Preveri rezultat
      const [result] = await connection.execute(
        'SELECT id, email, full_name, role FROM profiles WHERE email = ?',
        ['admin@standario.com']
      );
      console.log('\nUstvarjen uporabnik:');
      console.log(result[0]);
    }

    // Prikaži vse uporabnike
    const [allUsers] = await connection.execute(
      'SELECT id, email, full_name, role FROM profiles ORDER BY created_at DESC LIMIT 5'
    );
    console.log('\nZadnjih 5 uporabnikov:');
    allUsers.forEach(u => console.log(`  - ${u.email} (${u.role})`));

    await connection.end();
    console.log('\nPovezava zaprta');
  } catch (error) {
    console.error('Napaka:', error.message);
    process.exit(1);
  }
}

createAdminUser();
