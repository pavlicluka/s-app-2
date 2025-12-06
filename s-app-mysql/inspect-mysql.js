#!/usr/bin/env node
/**
 * MySQL Schema Inspector - raziskava strukture tabel
 */

import { mysqlAPI } from './mysql-client.js'

console.log('🔍 RAZISKAVA STRUKTURE MySQL BAZE')
console.log('='.repeat(50))

async function inspectDatabaseStructure() {
  try {
    // Pridobi seznam vseh tabel
    console.log('\n📋 SEZNAM TABEL V BAZI:')
    const { data: tables, error: tablesError } = await mysqlAPI.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `)
    
    if (tablesError) {
      console.error('❌ Napaka pri pridobivanju tabel:', tablesError)
      return
    }
    
    if (!tables || tables.length === 0) {
      console.log('⚠️  Nobenih tabel ni najdenih')
      return
    }
    
    tables.forEach(table => {
      console.log(`   📄 ${table.TABLE_NAME}`)
    })
    
    console.log(`\n📊 Skupaj tabel: ${tables.length}`)
    
    // Raziskuj strukturo vsake tabele
    for (const tableInfo of tables) {
      const tableName = tableInfo.TABLE_NAME
      console.log(`\n🔍 STRUKTURA TABELE: ${tableName}`)
      console.log('-'.repeat(40))
      
      // Stolpci tabele
      const { data: columns, error: columnsError } = await mysqlAPI.query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          EXTRA,
          COLUMN_COMMENT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [tableName])
      
      if (columnsError) {
        console.log(`❌ Napaka pri pridobivanju stolpcev za ${tableName}:`, columnsError)
        continue
      }
      
      if (columns && columns.length > 0) {
        console.log('Stolpci:')
        columns.forEach(col => {
          const nullInfo = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'
          const defaultInfo = col.COLUMN_DEFAULT ? `DEFAULT: ${col.COLUMN_DEFAULT}` : ''
          const extraInfo = col.EXTRA ? `(${col.EXTRA})` : ''
          const commentInfo = col.COLUMN_COMMENT ? ` - ${col.COLUMN_COMMENT}` : ''
          
          console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${nullInfo} ${defaultInfo} ${extraInfo}${commentInfo}`)
        })
      }
      
      // Foreign key omejitve
      const { data: fkConstraints, error: fkError } = await mysqlAPI.query(`
        SELECT 
          CONSTRAINT_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY CONSTRAINT_NAME
      `, [tableName])
      
      if (fkError) {
        console.log(`⚠️  Napaka pri pridobivanju FK omejitev:`, fkError)
      } else if (fkConstraints && fkConstraints.length > 0) {
        console.log('Foreign Key povezave:')
        fkConstraints.forEach(fk => {
          console.log(`   ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (${fk.CONSTRAINT_NAME})`)
        })
      } else {
        console.log('Foreign Key povezave: None')
      }
      
      // Število zapisov
      const { data: countResult, error: countError } = await mysqlAPI.select(tableName, 'COUNT(*) as count')
      
      if (countError) {
        console.log(`⚠️  Napaka pri štetju zapisov:`, countError)
      } else {
        const count = countResult?.[0]?.count || 0
        console.log(`📊 Število zapisov: ${count}`)
      }
      
      // Primer podatkov (če obstajajo)
      if (countResult?.[0]?.count > 0) {
        const { data: sampleData, error: sampleError } = await mysqlAPI.select(tableName, '*', '', [], 1)
        
        if (!sampleError && sampleData && sampleData.length > 0) {
          console.log('📋 Primer podatkov:')
          const sample = sampleData[0]
          // Prikaži samo prvih 5 polj za preglednost
          const keys = Object.keys(sample).slice(0, 5)
          keys.forEach(key => {
            console.log(`   ${key}: ${sample[key]}`)
          })
          if (Object.keys(sample).length > 5) {
            console.log(`   ... in še ${Object.keys(sample).length - 5} polj`)
          }
        }
      }
    }
    
  } catch (err) {
    console.error('💥 Kritična napaka:', err.message)
  }
}

async function testCurrentDataInsertion() {
  console.log('\n🧪 TESTIRA OBSTOJEČE PODATKE ZA VSTAVLJANJE')
  console.log('='.repeat(50))
  
  try {
    // Preveri organizacije
    const { data: orgs, error: orgError } = await mysqlAPI.select('organizations', '*')
    
    if (orgError) {
      console.log('❌ Napaka pri organizacijah:', orgError)
      return
    }
    
    console.log('📋 ORGANIZACIJE:')
    if (orgs && orgs.length > 0) {
      console.log(`   Najdenih: ${orgs.length}`)
      console.log('   Primer:', JSON.stringify(orgs[0], null, 2))
    } else {
      console.log('   Ni organizacij')
    }
    
    // Preveri profile
    const { data: profiles, error: profileError } = await mysqlAPI.select('profiles', '*')
    
    if (profileError) {
      console.log('❌ Napaka pri profilih:', profileError)
      return
    }
    
    console.log('\n👥 PROFILI:')
    if (profiles && profiles.length > 0) {
      console.log(`   Najdenih: ${profiles.length}`)
      console.log('   Primer:', JSON.stringify(profiles[0], null, 2))
    } else {
      console.log('   Ni profilov')
    }
    
  } catch (err) {
    console.error('❌ Test obstoječih podatkov neuspešen:', err.message)
  }
}

async function generateInsertScript() {
  console.log('\n📝 GENERIRANJE TEST INSERT SKRIPTE')
  console.log('='.repeat(50))
  
  try {
    // Preveri strukturo organizacij za pravilne INSERT podatke
    const { data: orgColumns, error: columnsError } = await mysqlAPI.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'organizations'
      ORDER BY ORDINAL_POSITION
    `)
    
    if (columnsError) {
      console.log('❌ Napaka pri pridobivanju strukture:', columnsError)
      return
    }
    
    console.log('📋 Ugotovljena struktura tabele organizations:')
    const validColumns = []
    orgColumns.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})`)
      validColumns.push(col.COLUMN_NAME)
    })
    
    // Ustvari demo podatke na podlagi strukture
    const testData = {}
    validColumns.forEach(col => {
      switch (col.toLowerCase()) {
        case 'id':
          testData[col] = null // AUTO_INCREMENT
          break
        case 'name':
          testData[col] = 'Test Organization Insert Test'
          break
        case 'email':
          testData[col] = 'test.insert@organization.com'
          break
        case 'created_at':
        case 'updated_at':
          testData[col] = new Date().toISOString()
          break
        case 'status':
        case 'active':
        case 'enabled':
          testData[col] = 1
          break
        case 'description':
          testData[col] = 'Test organizacija za vstavljanje podatkov'
          break
        default:
          // Preveri tip podatkov
          const columnInfo = orgColumns.find(c => c.COLUMN_NAME === col)
          if (columnInfo) {
            switch (columnInfo.DATA_TYPE) {
              case 'varchar':
              case 'text':
              case 'char':
                testData[col] = `Test ${col} value`
                break
              case 'int':
              case 'bigint':
              case 'decimal':
                testData[col] = 1
                break
              case 'datetime':
              case 'timestamp':
                testData[col] = new Date().toISOString()
                break
              case 'boolean':
                testData[col] = 1
                break
              default:
                testData[col] = 'test'
            }
          }
      }
    })
    
    console.log('\n🔧 PREDLOG TEST PODATKOV:')
    console.log(JSON.stringify(testData, null, 2))
    
    return testData
    
  } catch (err) {
    console.error('❌ Generiranje INSERT skripte neuspešno:', err.message)
  }
}

// Poženi raziskavo
async function runInspection() {
  await inspectDatabaseStructure()
  await testCurrentDataInsertion()
  await generateInsertScript()
  
  console.log('\n' + '='.repeat(50))
  console.log('🏁 RAZISKAVA ZAKLJUČENA')
}

runInspection().catch(err => {
  console.error('💥 Kritična napaka:', err)
  process.exit(1)
})