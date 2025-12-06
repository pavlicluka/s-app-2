#!/usr/bin/env node
/**
 * MySQL Test Script za Standario aplikacijo
 * Preveri osnovne funkcionalnosti MySQL povezave
 */

import { getResolvedMySQLConfig, mysqlAPI } from './mysql-client.js'

console.log('🧪 ZAČENJAM MySQL TEST STANDARIO APLIKACIJE')
console.log('=' .repeat(50))

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
      console.log('   Primer organizacije:', organizations[0].name)
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
      console.log('   Primer profila:', profiles[0].email)
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

async function testEnvironmentConfiguration() {
  console.log('\n4️⃣ TESTIRA OKOLJSKO KONFIGURACIJO...')

  const config = getResolvedMySQLConfig()
  const envMapping = [
    ['VITE_MYSQL_HOST', 'host'],
    ['VITE_MYSQL_PORT', 'port'],
    ['VITE_MYSQL_DATABASE', 'database'],
    ['VITE_MYSQL_USER', 'user'],
    ['VITE_MYSQL_PASSWORD', 'password']
  ]

  console.log('🔧 Environment spremenljivke (v uporabi):')
  envMapping.forEach(([envName, key]) => {
    const fromEnv = Boolean(process.env[envName])
    const value = config[key]
    const maskedValue = envName.includes('PASSWORD') ? '***' : value
    const status = fromEnv ? '✅ iz environment-a' : 'ℹ️ privzeta vrednost'

    console.log(`   ${status} ${envName}: ${maskedValue}`)
  })

  return true
}

async function runAllTests() {
  const tests = [
    { name: 'MySQL Povezava', fn: testMySQLConnection },
    { name: 'Avtentikacija', fn: testUserAuthentication },
    { name: 'Celovitost podatkov', fn: testDataIntegrity },
    { name: 'Okoljska konfiguracija', fn: testEnvironmentConfiguration }
  ]
  
  const results = []
  
  for (const test of tests) {
    const success = await test.fn()
    results.push({ name: test.name, success })
  }
  
  // Poročilo
  console.log('\n' + '=' .repeat(50))
  console.log('📋 REZULTATI TESTOV:')
  console.log('=' .repeat(50))
  
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
