import { mysqlAPI } from './src/lib/mysql-client';

async function testLogin() {
  console.log('🔍 Preverjam admin@standario.com uporabnika...');
  
  try {
    const { data: profiles, error } = await mysqlAPI.select('profiles', '*', 'email = ?', ['admin@standario.com']);
    
    if (error) {
      console.error('❌ Napaka pri iskanju:', error);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ Uporabnik admin@standario.com ne obstaja v bazi');
      return;
    }
    
    const profile = profiles[0];
    console.log('✅ Uporabnik najden:');
    console.log('- ID:', profile.id);
    console.log('- Email:', profile.email);
    console.log('- Ime:', profile.full_name);
    console.log('- Role:', profile.role);
    console.log('- Aktiven:', profile.is_active);
    console.log('- Hash gesla:', profile.password_hash ? 'Nastavljen' : 'Manjka');
    
    // Test hash gesla Demo2025!
    const crypto = await import('crypto');
    const password = 'Demo2025!';
    const salt = 'standario-salt-2025';
    const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
    
    console.log('- Generiran hash za Demo2025!:', hash.substring(0, 16) + '...');
    console.log('- Baza hash:', profile.password_hash ? profile.password_hash.substring(0, 16) + '...' : 'Ni hash-a');
    console.log('- Hash se ujema:', hash === profile.password_hash ? 'DA' : 'NE');
    
  } catch (err) {
    console.error('❌ Nepričakovana napaka:', err);
  }
}

testLogin();