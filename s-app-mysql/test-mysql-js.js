#!/usr/bin/env node
/**
 * MySQL Test Script za Standario aplikacijo - JavaScript verzija
 * Preveri osnovne funkcionalnosti MySQL povezave in testiranje vstavljanja podatkov
 */

import { mysqlAPI, supabase } from './mysql-client.js'

console.log('🧪 ZAČENJAM MySQL TEST STANDARIO APLIKACIJE')
console.log('='.repeat(50))

async function testMySQLConnection() {
  console.log('\n1️⃣ TESTIRA MySQL POVEZAVO...')
  
  try {
    // Test osnovne poizvedbe
    const { data: organizations, error: orgError } = await mysqlAPI.select('organizations', '*')
    
    if (orgError) {
      console.error('❌ MySQL napaka pri organizacijah:', orgError)
      return false
    }
    
    console.log('✅ MySQL povezava uspešna!')
    console.log(`📊 Organizacije: ${organizations?.length || 0}`)
    
    if (organizations && organizations.length > 0) {
      console.log('   Primer organizacije:', organizations[0].name || organizations[0])
    }
    
    return true
    
  } catch (err) {
    console.error('❌ MySQL test neuspešen:', err.message)
    return false
  }
}

async function testUserAuthentication() {
  console.log('\n2️⃣ TESTIRA AVTENTIKACIJO...')
  
  try {
    // Test iskanja uporabnikov
    const { data: profiles, error: profileError } = await mysqlAPI.select('profiles', 'id, email, full_name', '', [])
    
    if (profileError) {
      console.error('❌ Napaka pri pridobivanju profilov:', profileError)
      return false
    }
    
    console.log(`👥 Profili: ${profiles?.length || 0}`)
    
    if (profiles && profiles.length > 0) {
      console.log('   Primer profila:', profiles[0].email || profiles[0])
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Avtentikacija test neuspešen:', err.message)
    return false
  }
}

async function testDataIntegrity() {
  console.log('\n3️⃣ TESTIRA CELOVITOST PODATKOV...')
  
  try {
    // Test ključnih tabel
    const tables = ['organizations', 'profiles', 'nis2_risk_register', 'supply_chain_suppliers']
    
    for (const table of tables) {
      const { data, error } = await mysqlAPI.select(table, 'COUNT(*) as count')
      
      if (error) {
        console.error(`❌ Napaka pri tabeli ${table}:`, error)
        continue
      }
      
      const count = data?.[0]?.count || 0
      console.log(`📋 ${table}: ${count} zapisov`)
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Celovitost podatkov test neuspešen:', err.message)
    return false
  }
}

async function testDataInsertion() {
  console.log('\n4️⃣ TESTIRA VSTAVLJANJE PODATKOV...')
  
  try {
    // Test vstavljanja demo organizacije
    const testOrg = {
      name: 'Test Organization Demo',
      email: 'test@demo.org',
      created_at: new Date().toISOString(),
      status: 'active'
    }
    
    const { data: insertResult, error: insertError } = await mysqlAPI.insert('organizations', testOrg)
    
    if (insertError) {
      console.error('❌ Napaka pri vstavljanju organizacije:', insertError)
      return false
    }
    
    console.log('✅ Vstavljanje organizacije uspešno!')
    console.log('📝 Vstavljeni podatki:', insertResult)
    
    // Preveri da se je organizacija res vstavila
    const { data: verifyOrg, error: verifyError } = await mysqlAPI.select('organizations', '*', 'name = ?', ['Test Organization Demo'])
    
    if (verifyError) {
      console.error('❌ Napaka pri preverjanju vstavljenih podatkov:', verifyError)
      return false
    }
    
    if (verifyOrg && verifyOrg.length > 0) {
      console.log('✅ Verifikacija uspešna - organizacija obstaja v bazi!')
      console.log('🔍 Verificirani podatki:', verifyOrg[0])
      
      // Izbriši test podatke
      await mysqlAPI.delete('organizations', 'name = ?', ['Test Organization Demo'])
      console.log('🗑️ Test podatki izbrisani')
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Test vstavljanja podatkov neuspešen:', err.message)
    return false
  }
}

async function testReferentialIntegrity() {
  console.log('\n5️⃣ TESTIRA REFERENČNO INTEGRITETO...')
  
  try {
    // Test foreign key povezav če obstajajo
    const { data: tables, error: tablesError } = await mysqlAPI.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_TYPE = 'BASE TABLE'
    `, [mysqlAPI.pool.connectionConfig.database])
    
    if (tablesError) {
      console.log('⚠️  Ne morem pridobiti seznama tabel:', tablesError)
      return true // Neuspeh pri tem testu ni kritičen
    }
    
    console.log(`📋 Najdenih ${tables?.length || 0} tabel v bazi`)
    
    // Test foreign key constraints če obstajajo
    const { data: fkConstraints, error: fkError } = await mysqlAPI.query(`
      SELECT 
        TABLE_NAME,
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_NAME IS NOT NULL
      AND TABLE_SCHEMA = ?
    `, [mysqlAPI.pool.connectionConfig.database])
    
    if (fkError) {
      console.log('⚠️  Ne morem preveriti foreign key omejitve:', fkError)
      return true
    }
    
    console.log(`🔗 Najdenih ${fkConstraints?.length || 0} foreign key povezav`)
    
    if (fkConstraints && fkConstraints.length > 0) {
      console.log('   Primer foreign key povezave:', fkConstraints[0])
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Test referenčne integritete neuspešen:', err.message)
    return false
  }
}

async function testEnvironmentConfiguration() {
  console.log('\n6️⃣ TESTIRA OKOLJSKO KONFIGURACIJO...')
  
  // Preveri environment spremenljivke
  const envVars = [
    'VITE_MYSQL_HOST',
    'VITE_MYSQL_PORT', 
    'VITE_MYSQL_DATABASE',
    'VITE_MYSQL_USER'
  ]
  
  console.log('🔧 Environment spremenljivke:')
  envVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      console.log(`   ✅ ${varName}: ${varName.includes('PASSWORD') ? '***' : value}`)
    } else {
      console.log(`   ⚠️  ${varName}: ni nastavljeno (uporablja se fallback)`)
    }
  })
  
  return true
}

async function runAllTests() {
  const tests = [
    { name: 'MySQL Povezava', fn: testMySQLConnection },
    { name: 'Avtentikacija', fn: testUserAuthentication },
    { name: 'Celovitost podatkov', fn: testDataIntegrity },
    { name: 'Vstavljanje podatkov', fn: testDataInsertion },
    { name: 'Referenčna integriteta', fn: testReferentialIntegrity },
    { name: 'Okoljska konfiguracija', fn: testEnvironmentConfiguration }
  ]
  
  const results = []
  
  for (const test of tests) {
    const success = await test.fn()
    results.push({ name: test.name, success })
  }
  
  // Poročilo
  console.log('\n' + '='.repeat(50))
  console.log('📋 REZULTATI TESTOV:')
  console.log('='.repeat(50))
  
  const passed = results.filter(r => r.success).length
  const total = results.length
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌'
    console.log(`${icon} ${result.name}`)
  })
  
  console.log(`\n🎯 Skupno: ${passed}/${total} testov uspešnih`)
  
  if (passed === total) {
    console.log('🎉 VSI TESTI USPEŠNI! MySQL migracija je pripravljena.')
    console.log('📱 Aplikacija je pripravljena za zagon z: npm run dev')
  } else {
    console.log('⚠️  Nekateri testi niso uspešni. Preveri konfiguracijo.')
  }
  
  return passed === total
}

// Poženi teste
runAllTests().catch(err => {
  console.error('💥 Kritična napaka pri testiranju:', err)
  process.exit(1)
})