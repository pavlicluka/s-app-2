#!/usr/bin/env node
import { mysqlAPI } from './mysql-client.js'

console.log('🔍 PREVERANJE STRUKTURE TABELE ORGANIZATIONS')
console.log('='.repeat(50))

async function checkOrganizationsStructure() {
  try {
    // Preveri strukturo tabele organizations
    const { data: columns, error } = await mysqlAPI.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'organizations'
      ORDER BY ORDINAL_POSITION
    `)
    
    if (error) {
      console.error('❌ Napaka:', error)
      return
    }
    
    console.log('📋 Stolpci v tabeli organizations:')
    columns.forEach(col => {
      const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'
      const defVal = col.COLUMN_DEFAULT ? `DEFAULT: ${col.COLUMN_DEFAULT}` : 'NO DEFAULT'
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${nullable} ${defVal}`)
    })
    
    // Poskusi vstaviti podatke z obstoječimi stolpci
    const testOrg = {
      name: 'Test Organization Insert Test',
      email: 'test.insert@organization.com',
      created_at: new Date().toISOString()
    }
    
    console.log('\n🧪 Test vstavljanja z ugotovljeno strukturo:')
    console.log('Podatki za vstaviti:', JSON.stringify(testOrg, null, 2))
    
    const { data: insertResult, error: insertError } = await mysqlAPI.insert('organizations', testOrg)
    
    if (insertError) {
      console.error('❌ Napaka pri vstavljanju:', insertError)
    } else {
      console.log('✅ Vstavljanje uspešno!')
      console.log('Rezultat:', insertResult)
      
      // Verifikacija
      const { data: verifyOrg, error: verifyError } = await mysqlAPI.select('organizations', '*', 'name = ?', ['Test Organization Insert Test'])
      
      if (verifyError) {
        console.log('⚠️  Napaka pri verifikaciji:', verifyError)
      } else if (verifyOrg && verifyOrg.length > 0) {
        console.log('✅ Verifikacija uspešna!')
        console.log('Vstavljeni podatki:', JSON.stringify(verifyOrg[0], null, 2))
        
        // Briši test podatke
        const { error: deleteError } = await mysqlAPI.delete('organizations', 'name = ?', ['Test Organization Insert Test'])
        if (deleteError) {
          console.log('⚠️  Napaka pri brisanju test podatkov:', deleteError)
        } else {
          console.log('🗑️ Test podatki uspešno izbrisani')
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Kritična napaka:', err.message)
  }
}

checkOrganizationsStructure()