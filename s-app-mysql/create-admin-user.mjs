import mysql from 'mysql2/promise';
import crypto from 'crypto';

const PASSWORD_SALT = 'standario-salt-2025';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@standario.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gesloteslo';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + PASSWORD_SALT).digest('hex');
}

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
      [ADMIN_EMAIL]
    );

    if (existing.length > 0) {
      console.log('\nAdmin uporabnik ze obstaja - posodabljam geslo in vlogo:');
      await connection.execute(
        `UPDATE profiles SET password_hash = ?, role = 'super_admin', is_active = 1, updated_at = NOW() WHERE email = ?`,
        [hashPassword(ADMIN_PASSWORD), ADMIN_EMAIL]
      );
      const [updated] = await connection.execute(
        'SELECT id, email, full_name, role FROM profiles WHERE email = ?',
        [ADMIN_EMAIL]
      );
      console.log(updated[0]);
    } else {
      console.log('\nUstvarjam admin uporabnika...');

      // Ustvari admin uporabnika
      await connection.execute(
        `INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        ['admin-user-001', ADMIN_EMAIL, 'Administrator', 'super_admin', 1]
      );

      await connection.execute(
        'UPDATE profiles SET password_hash = ?, user_id = COALESCE(user_id, id) WHERE email = ?',
        [hashPassword(ADMIN_PASSWORD), ADMIN_EMAIL]
      );

      console.log('Admin uporabnik uspesno ustvarjen!');
      
      // Preveri rezultat
      const [result] = await connection.execute(
        'SELECT id, email, full_name, role FROM profiles WHERE email = ?',
        [ADMIN_EMAIL]
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
