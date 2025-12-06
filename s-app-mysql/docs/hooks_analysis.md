# Analiza Hook Datotek - Supabase vs MySQL

## Pregled

V tem poročilu so analizirane vse hook datoteke v `/workspace/s-app-mysql/src/hooks/` z namenom ugotoviti, katere še vedno uporabljajo Supabase namesto MySQL.

## Seznam Hook Datotek

### 1. ✅ MySQL (Posodobljeno)
- **Datoteka**: `useActiveAlerts.tsx`
- **Opis**: Hook za prikazovanje aktivnih opozoril (incidenti, prijave, GDPR zahtevki)
- **Podatki ki jih bere**:
  - **Tabela `incidents`**: Varnostni incidenti (id, incident_id, type, detected_at, description, estimated_damage, severity, status, organization_id, created_at, updated_at)
  - **Tabela `prijave`**: ZZPri prijave (id, stevilo_prijave, kratek_opis, podrocje, status, datum_potrditev, datum_resitve, created_at, updated_at)
  - **Tabela `gdpr_right_forgotten`**: GDPR zahtevki (id, request_id, subject_name, subject_email, request_date, request_type, status, response_deadline, legal_basis_description, data_categories, data_description, organization_id, created_at, updated_at)
- **MySQL implementacija**: Uporablja `mysqlAPI.select()` klice za paralelno pridobivanje podatkov
- **Dodatne funkcionalnosti**: 
  - Demo mode podpora z mock podatki
  - Filtriranje starih incidentov (starejših od 1 dneva)
  - Filtriranje prijav s kratkimi roki (manj kot 3 dni)
  - Filtriranje poteklih GDPR zahtevkov

### 2. ❌ Supabase (Še ni posodobljeno)
- **Datoteka**: `useOrganization.tsx`
- **Opis**: Context provider in hook za upravljanje organizacijskega konteksta
- **Podatki ki jih bere**:
  - **Tabela `profiles`**: Uporabniški profili z organizacijskimi podatki (id, email, full_name, organization_id, created_at, updated_at)
  - **Tabela `organizations`**: Organizacije (id, name, is_active, slug)
  - **Tabela `user_organizations`**: Povezave med uporabniki in organizacijami (user_id, organization_id, role, is_primary)
- **Supabase implementacija**: Uporablja `supabase.from().select()` z joini in komplesko logiko za organizacijsko članstvo
- **Glavne funkcionalnosti**:
  - Samodejno preklapljanje med organizacijami
  - Validacija aktivnih organizacij
  - Demo mode podpora
  - Avtomatska dodelitev organizacije če uporabnik nima

### 3. ❌ Supabase (Še ni posodobljeno)
- **Datoteka**: `useOrganizationId.ts`
- **Opis**: Enostaven hook za pridobivanje ID-ja organizacije
- **Podatki ki jih bere**:
  - **Tabela `profiles`**: Organization_id iz uporabniškega profila
- **Supabase implementacija**: `supabase.from('profiles').select('organization_id').eq('id', user.id)`
- **Funkcionalnost**: Vrača organization_id trenutnega uporabnika

### 4. ❌ Supabase (Še ni posodobljeno)
- **Datoteka**: `useProfile.tsx`
- **Opis**: Context provider in hook za upravljanje uporabniških profilov in organizacij
- **Podatki ki jih bere**:
  - **Tabela `profiles`**: Celoten uporabniški profil (vsi atributi iz Profile interface)
  - **Tabela `organizations`**: Podrobnosti o organizaciji
- **Supabase implementacija**: Kompleksni query-ji z `supabase.from().select()` in avtomatskim ustvarjanjem profila
- **Glavne funkcionalnosti**:
  - Upravljanje profilov
  - Organizacijsko članstvo
  - Permission sistem (owner, admin, member, viewer)
  - Avtomatsko ustvarjanje profila če ne obstaja
  - Refresh funkcionalnosti

### 5. ✅ Ne uporablja nobene baze
- **Datoteka**: `use-mobile.tsx`
- **Opis**: Hook za zaznavanje mobilnih naprav
- **Funkcionalnost**: Preverja širino zaslona proti mejni vrednosti (768px)
- **Stanje**: ✅ V redu - ne potrebuje posodobitve

### 6. ✅ Ne uporablja nobene baze
- **Datoteka**: `use-toast.ts`
- **Opis**: Hook za upravljanje toast obvestil
- **Funkcionalnost**: State management za toast sporočila z reducer pattern
- **Stanje**: ✅ V redu - ne potrebuje posodobitve

### 7. ✅ Ne uporablja nobene baze
- **Datoteka**: `useEmsisoftAPI.ts`
- **Opis**: Hook za integracijo z Emsisoft API
- **Funkcionalnost**: Lastni API client za Emsisoft anti-virus sistem
- **Stanje**: ✅ V redu - uporablja svoj API, ne Supabase/MySQL

### 8. ✅ Ne uporablja nobene baze
- **Datoteka**: `useSaveRetry.tsx`
- **Opis**: Hook za ponovno poskusovanje shranjevanja z lint preverjanjem
- **Funkcionalnost**: Utility za retry mehanizem pri shranjevanju
- **Stanje**: ✅ V redu - ne potrebuje posodobitve

## Povzetek Stanja

### MySQL ✅ (1 datoteka)
1. `useActiveAlerts.tsx` - **POPOLNOMA POSODOBLJENA** na MySQL

### Supabase ❌ (3 datoteke)
1. `useOrganization.tsx` - **POTREBUJE POSODOBITEV** na MySQL
2. `useOrganizationId.ts` - **POTREBUJE POSODOBITEV** na MySQL  
3. `useProfile.tsx` - **POTREBUJE POSODODBO** na MySQL

### Ne potrebujejo posodobitve ✅ (4 datoteke)
1. `use-mobile.tsx` - UI utility
2. `use-toast.ts` - UI utility
3. `useEmsisoftAPI.ts` - Zunanji API
4. `useSaveRetry.tsx` - Utility

## Priporočila za Nadaljevanje

### Prioriteta 1 - Posodobitev Supabase datotek na MySQL

1. **useOrganizationId.ts** - Najenostavnejša za posodobitev
   - Zamenjati `supabase.from('profiles').select('organization_id')` z `mysqlAPI.select('profiles', 'organization_id', 'id = ?', [user.id])`

2. **useOrganization.tsx** - Srednja kompleksnost
   - Implementirati MySQL klice za `profiles`, `organizations`, `user_organizations`
   - Obdržati kompleksno logiko za organizacijsko članstvo
   - Poskrbeti za demo mode

3. **useProfile.tsx** - Najkompleksnejša
   - Implementirati MySQL klice za `profiles` in `organizations`
   - Poskrbeti za avtomatsko ustvarjanje profila
   - Obdržati permission sistem
   - Implementirati refresh funkcionalnosti

### Koristni ukrepi
- Ustvariti MySQL helper funkcije za complexe join-e (podobno kot v `useActiveAlerts.tsx`)
- Ohraniti demo mode funkcionalnosti
- Testirati vse funkcionalnosti po posodobitvi
- Posodobiti TypeScript tipe če je potrebno

## Zaključek

Izmed 8 hook datotek:
- **1 je popolnoma posodobljena** na MySQL
- **3 še vedno uporabljajo Supabase** in potrebujejo posodobitev
- **4 ne potrebujejo posodobitve** ker ne uporabljajo nobene baze

Skupno je torej **37.5%** Supabase hook-ov že uspešno pretvorjenih na MySQL, **37.5%** še potrebuje pretvorbo, in **25%** ne potrebuje nobene spremembe.

Datum analize: 2025-11-30
