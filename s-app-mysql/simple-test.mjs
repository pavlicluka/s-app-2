import { mysqlAPI } from './mysql-client.js'

console.log('🧪 TEST VSTAVLJANJA PODATKOV')
console.log('='.repeat(50))

async function testInsert() {
  try {
    const testOrg = {
      name: 'Test Insert Organization',
      slug: 'test-insert-org',
      description: 'Test organizacija',
      email: 'test@example.com'
    }
    
    console.log('Vstavljamo:', testOrg)
    
    const result = await mysqlAPI.insert('organizations', testOrg)
    
    if (result.error) {
      console.error('Napaka:', result.error)
    } else {
      console.log('Uspeh:', result.data)
      
      // Verifikacija
      const verify = await mysqlAPI.select('organizations', '*', 'name = ?', ['Test Insert Organization'])
      console.log('Verifikacija:', verify.data)
      
      // Briši
      const del = await mysqlAPI.delete('organizations', 'name = ?', ['Test Insert Organization'])
      console.log('Izbrisano:', del)
    }
    
  } catch (err) {
    console.error('Kritična napaka:', err.message)
  }
}

testInsert()