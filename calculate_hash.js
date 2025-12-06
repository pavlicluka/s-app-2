// Izračuna hash vrednost za Standario gesla
async function calculateHash() {
  const password = 'Demo2025!';
  const salt = 'standario-salt-2025';
  
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  console.log('Hash vrednost za geslo "Demo2025!":');
  console.log(hashHex);
  console.log('');
  console.log('SQL za posodobitev uporabnikov:');
  console.log(`UPDATE profiles SET password_hash = '${hashHex}' WHERE email = 'admin@standario.com';`);
  console.log(`UPDATE profiles SET password_hash = '${hashHex}' WHERE email = 'demo@standario.com';`);
}

calculateHash();