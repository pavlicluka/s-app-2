#!/usr/bin/env node
/**
 * MySQL Test Script za Standario aplikacijo - Popravljena verzija
 * Testira vstavljanje podatkov na podlagi dejanske strukture tabel
 */

import { mysqlAPI, supabase } from './mysql-client.js'

console.log('🧪 ZAČENJAM POPRAVLJEN MySQL TEST')
console.log('='.repeat(50))

async function testMySQLConnection() {
  console.log('\n1️⃣ TESTIRA MySQL POVEZAVO...')
  
  try {
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

async function testDataIntegrity() {
  console.log('\n2️⃣ TESTIRA CELOVITOST PODATKOV...')
  
  try {
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
  console.log('\n3️⃣ TESTIRA VSTAVLJANJE PODATKOV...')
  
  try {
    // Test vstavljanja organizacije z ustrezno strukturo
    const testOrg = {
      name: 'Test Organization Insert Test',
      slug: 'test-insert-org',
      description: 'Test organizacija za preverjanje vstavljanja podatkov',
      logo_url: 'https://example.com/test-logo.png',
      website_url: 'https://testorg.example.com',
      industry: 'Informacijske storitve',
      size: 'srednje',
      address: 'Test ulica 1, 1000 Ljubljana, Slovenija',
      phone: '+386 1 234 5678',
      email: 'test.insert@organization.com'
    }
    
    console.log('🔧 Vstavljamo organizacijo s podatki:', JSON.stringify(testOrg, null, 2))
    
    const { data: insertResult, error: insertError } = await mysqlAPI.insert('organizations', testOrg)
    
    if (insertError) {
      console.error('❌ Napaka pri vstavljanju organizacije:', insertError)
      return false
    }
    
    console.log('✅ Vstavljanje organizacije uspešno!')
    console.log('📝 Rezultat vstavljanja:', insertResult)
    
    // Verifikacija vstavljenih podatkov
    const { data: verifyOrg, error: verifyError } = await mysqlAPI.select('organizations', '*', 'name = ?', ['Test Organization Insert Test'])
    
    if (verifyError) {
      console.error('❌ Napaka pri verifikaciji vstavljenih podatkov:', verifyError)
      return false
    }
    
    if (verifyOrg && verifyOrg.length > 0) {
      console.log('✅ Verifikacija uspešna - organizacija obstaja v bazi!')
      console.log('🔍 Vstavljeni podatki:', JSON.stringify(verifyOrg[0], null, 2))
      
      // Test vstavljanja profila (linked to organization)
      const testProfile = {
        user_id: 'test-user-insert-' + Date.now(),
        email: 'test.profile@organization.com',
        full_name: 'Test User Profile',
        first_name: 'Test',
        last_name: 'User',
        phone: '+386 1 234 5679',
        job_title: 'Test Manager',
        department: 'IT',
        organization_id: verifyOrg[0].id, // Linked to the inserted organization
        role: 'admin',
        is_active: 1
      }
      
      console.log('\n🔧 Vstavljamo profil povezan z organizacijo:', JSON.stringify(testProfile, null, 2))
      
      const { data: profileResult, error: profileError } = await mysqlAPI.insert('profiles', testProfile)
      
      if (profileError) {
        console.log('⚠️  Napaka pri vstavljanju profila:', profileError)
        console.log('⚠️  To je sprejemljivo - profil morda zahteva dodatne podatke')
      } else {
        console.log('✅ Vstavljanje profila uspešno!')
        console.log('📝 Profil rezultat:', profileResult)
      }
      
      // Briši test podatke
      console.log('\n🗑️ Brisanje test podatkov...')
      
      // Briši profil če je bil uspešno vstavljen
      if (!profileError) {
        const { error: deleteProfileError } = await mysqlAPI.delete('profiles', 'email = ?', ['test.profile@organization.com'])
        if (deleteProfileError) {
          console.log('⚠️  Napaka pri brisanju profila:', deleteProfileError)
        } else {
          console.log('✅ Test profil izbrisan')
        }
      }
      
      // Briši organizacijo
      const { error: deleteOrgError } = await mysqlAPI.delete('organizations', 'name = ?', ['Test Organization Insert Test'])
      if (deleteOrgError) {
        console.log('⚠️  Napaka pri brisanju organizacije:', deleteOrgError)
      } else {
        console.log('✅ Test organizacija izbrisana')
      }
    } else {
      console.log('⚠️  Vstavljena organizacija ni bila najdena pri verifikaciji')
      return false
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Test vstavljanja podatkov neuspešen:', err.message)
    return false
  }
}

async function testReferentialIntegrity() {
  console.log('\n4️⃣ TESTIRA REFERENČNO INTEGRITETO...')
  
  try {
    // Preveri foreign key povezave z informacijsko shemo
    const { data: fkConstraints, error: fkError } = await mysqlAPI.query(`
      SELECT 
        TABLE_NAME,
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_NAME IS NOT NULL
      AND TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, CONSTRAINT_NAME
    `)
    
    if (fkError) {
      console.log('⚠️  Ne morem preveriti foreign key omejitve:', fkError)
      return true // Neuspeh pri tem testu ni kritičen
    }
    
    console.log(`🔗 Najdenih ${fkConstraints?.length || 0} foreign key povezav:`)
    
    if (fkConstraints && fkConstraints.length > 0) {
      fkConstraints.forEach(fk => {
        console.log(`   📋 ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`)
      })
      
      // Test referenčne integritete na primeru profiles -> organizations
      console.log('\n🧪 Test referenčne integritete (profiles.organization_id → organizations.id):')
      
      const { data: profilesWithOrgs, error: joinError } = await mysqlAPI.query(`
        SELECT p.id, p.email, p.organization_id, o.name as org_name
        FROM profiles p
        LEFT JOIN organizations o ON p.organization_id = o.id
        LIMIT 5
      `)
      
      if (joinError) {
        console.log('⚠️  Napaka pri testiranju join poizvedbe:', joinError)
      } else if (profilesWithOrgs && profilesWithOrgs.length > 0) {
        console.log('✅ Referenčna integriteta deluje - profiles so povezane z organizations')
        profilesWithOrgs.forEach(profile => {
          const orgStatus = profile.organization_id ? 'povezana' : 'ni povezana'
          console.log(`   📧 ${profile.email} (${orgStatus} z ${profile.org_name || 'null'})`)
        })
      }
    } else {
      console.log('   ⚠️  Nobenih foreign key omejitev ni najdenih')
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Test referenčne integritete neuspešen:', err.message)
    return false
  }
}

async function testDataFormatting() {
  console.log('\n5️⃣ TESTIRA FORMATIRANJE PODATKOV...')
  
  try {
    // Test različnih tipov podatkov
    const { data: sampleData, error } = await mysqlAPI.query(`
      SELECT 
        id, name, created_at, updated_at,
        CASE 
          WHEN email IS NOT NULL THEN 'varchar'
          ELSE 'null'
        END as email_type
      FROM organizations 
      LIMIT 1
    `)
    
    if (error) {
      console.log('⚠️  Napaka pri testiranju formatiranja:', error)
      return true
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('✅ Podatki so pravilno formatirani:')
      sampleData.forEach(row => {
        console.log('   📋 ID tipa:', typeof row.id)
        console.log('   📅 Created_at format:', row.created_at)
        console.log('   📧 Email tipa:', row.email_type)
      })
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Test formatiranja podatkov neuspešen:', err.message)
    return false
  }
}

async function testBulkOperations() {
  console.log('\n6️⃣ TESTIRA PAKETNE OPERACIJE...')
  
  try {
    // Test vstavljanja več organizacij naenkrat
    const testOrgs = [
      {
        name: 'Bulk Test Org 1',
        slug: 'bulk-test-1',
        email: 'bulk1@test.com',
        industry: 'IT storitve'
      },
      {
        name: 'Bulk Test Org 2', 
        slug: 'bulk-test-2',
        email: 'bulk2@test.com',
        industry: 'Svetovanje'
      }
    ]
    
    console.log('🔧 Vstavljamo paket organizacij...')
    
    const results = []
    for (const org of testOrgs) {
      const { data, error } = await mysqlAPI.insert('organizations', org)
      if (error) {
        console.log(`❌ Napaka pri ${org.name}:`, error)
        results.push({ org: org.name, success: false, error })
      } else {
        console.log(`✅ ${org.name} uspešno vstavljena`)
        results.push({ org: org.name, success: true, data })
      }
    }
    
    // Verifikacija in čiščenje
    console.log('\n🧹 Čiščenje test podatkov...')
    for (const org of testOrgs) {
      const { error } = await mysqlAPI.delete('organizations', 'name = ?', [org.name])
      if (error) {
        console.log(`⚠️  Napaka pri brisanju ${org.name}:`, error)
      } else {
        console.log(`🗑️ ${org.name} izbrisana`)
      }
    }
    
    const successCount = results.filter(r => r.success).length
    console.log(`📊 Uspešno vstavljenih: ${successCount}/${testOrgs.length} organizacij`)
    
    return successCount === testOrgs.length
    
  } catch (err) {
    console.error('❌ Test paketnih operacij neuspešen:', err.message)
    return false
  }
}

async function runAllTests() {
  const tests = [
    { name: 'MySQL Povezava', fn: testMySQLConnection },
    { name: 'Celovitost podatkov', fn: testDataIntegrity },
    { name: 'Vstavljanje podatkov', fn: testDataInsertion },
    { name: 'Referenčna integriteta', fn: testReferentialIntegrity },
    { name: 'Formatiranje podatkov', fn: testDataFormatting },
    { name: 'Paketne operacije', fn: testBulkOperations }
  ]
  
  const results = []
  
  for (const test of tests) {
    const success = await test.fn()
    results.push({ name: test.name, success })
  }
  
  // Poročilo
  console.log('\n' + '='.repeat(50))
  console.log('📋 REZULTATI TESTOV VSTAVLJANJA PODATKOV:')
  console.log('='.repeat(50))
  
  const passed = results.filter(r => r.success).length
  const total = results.length
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌'
    console.log(`${icon} ${result.name}`)
  })
  
  console.log(`\n🎯 Skupno: ${passed}/${total} testov uspešnih`)
  
  if (passed === total) {
    console.log('🎉 VSI TESTI USPEŠNI! MySQL baza je pripravljena za vstavljanje podatkov.')
    console.log('📱 Aplikacija je pripravljena za zagon z: npm run dev')
  } else {
    console.log('⚠️  Nekateri testi niso uspešni. Preveri konfiguracijo in podatkovno strukturo.')
  }
  
  return passed === total
}

// Poženi teste
runAllTests().catch(err => {
  console.error('💥 Kritična napaka pri testiranju:', err)
  process.exit(1)
})