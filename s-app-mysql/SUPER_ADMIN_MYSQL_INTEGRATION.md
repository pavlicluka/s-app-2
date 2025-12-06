# Super Admin Dashboard - MySQL Profiles Integration

## Pregled problema

### Prvotno stanje
- **SuperAdminPage** je uporabljal Supabase Edge Functions (`admin-users`, `admin-organizations`)
- Edge functions so dostopali do **Supabase PostgreSQL** baze
- **MySQL baza** je imela `profiles` tabelo z 8 zapisi, vendar **brez povezave** s Supabase
- Novi zapisi iz SuperAdminPage se **niso shranjeval**i v MySQL bazo

### Arhitektura (PRED popravkom)
```
Frontend (SuperAdminPage)
    ↓
Supabase Edge Functions (admin-users, admin-organizations)
    ↓
Supabase PostgreSQL (profiles tabela)

LOČENO (brez povezave):
MySQL Database (profiles tabela) - 8 zapisov
```

## Implementirana rešitev

### Posodobitve kode

**Datoteka**: `src/components/SuperAdminPage.tsx`

**Spremembe**:
1. **Odstranjena odvisnost od Edge Functions** - Vsi klici `invokeAdminFunction()` so zamenjani z direktnimi Supabase query
2. **Implementirane direktne CRUD operacije**:
   - **READ**: `supabase.from('profiles').select('*')`
   - **CREATE**: `supabase.auth.signUp()` + `supabase.from('profiles').insert()`
   - **UPDATE**: `supabase.from('profiles').update().eq('id', userId)`
   - **DELETE**: `supabase.from('profiles').delete().eq('id', userId)`
   - **BULK DELETE**: Zanka preko vseh izbranih uporabnikov
   - **BULK UPDATE**: Zanka za posodobitev organizacije

3. **Filtri in iskanje**:
   - Iskanje po email-u in imenu: `.or(\`email.ilike.%${search}%,full_name.ilike.%${search}%\`)`
   - Filtriranje po organizaciji: `.eq('organization_id', orgId)`
   - Filtriranje po vlogi: `.eq('role', role)`

4. **Organizacije**:
   - Prav tako implementirane direktne Supabase query
   - Podpora za CRUD operacije na tabeli `organizations`

### Arhitektura (PO popravku)
```
Frontend (SuperAdminPage)
    ↓
Supabase JavaScript Client (direktni query)
    ↓
Supabase PostgreSQL (profiles in organizations tabele)
```

## Deployment informacije

**URL**: https://u21ijn9rt7sl.space.minimax.io  
**Datum**: 2025-11-30  
**Build**: Uspešen (9.59s)

## Trenutno stanje podatkov

### Supabase PostgreSQL - Tabela `profiles`
**Število zapisov**: 5

| Email | Full Name | Role | Org ID |
|-------|-----------|------|--------|
| admin@standario.com | Administrator | super_admin | - |
| demo@standario.com | Demo Uporabnik | user | - |
| rcqmnhvf@minimax.com | Test Uporabnik | admin | - |
| thwnwrvj@minimax.com | Test User | admin | - |
| demo.standario@minimax.com | Demo Uporabnik Standario | admin | - |

### MySQL - Tabela `profiles`
**Število zapisov**: 8

**Opomba**: MySQL tabela **ni povezana** s Supabase PostgreSQL. To sta dva ločena sistema.

## Testiranje

### Avtomatično testiranje
- ✅ Supabase klient inicializacija uspešna
- ✅ Tabela `profiles` obstaja
- ✅ RLS politike omogočajo dostop
- ✅ 5 profilov uspešno prebrano

### Ročno testiranje (Navodila)

#### 1. Dostop do Super Admin Dashboard
```
URL: https://u21ijn9rt7sl.space.minimax.io/?demo=true
```

#### 2. Prijava
- Demo način: Dodaj `?demo=true` k URL-ju
- Normalen način: Prijava z `admin@standario.com` (potrebno geslo)

#### 3. Testiranje funkcionalnosti

**Branje uporabnikov (READ)**:
1. Odpri zavihek "Uporabniki"
2. Preveri, ali se prikaže seznam uporabnikov
3. Poskusi iskanje po imenu ali email-u
4. Poskusi filtriranje po organizaciji
5. Poskusi filtriranje po vlogi

**Ustvarjanje novega uporabnika (CREATE)**:
1. Klikni gumb "Dodaj uporabnika"
2. Vnesi podatke:
   - Email (obvezno)
   - Geslo (obvezno)
   - Polno ime
   - Vloga (user/admin/super_admin)
   - Organizacija (izberi iz seznama)
3. Klikni "Ustvari"
4. Preveri, ali se nov uporabnik prikaže v seznamu

**Posodabljanje uporabnika (UPDATE)**:
1. Najdi uporabnika v seznamu
2. Klikni ikono "Edit" (svinčnik)
3. Spremeni podatke (ime, vloga, organizacija)
4. Klikni "Shrani"
5. Preveri, ali so spremembe shranjene

**Brisanje uporabnika (DELETE)**:
1. Najdi testnega uporabnika
2. Klikni ikono "Trash" (koš)
3. Potrdi brisanje
4. Preveri, ali je uporabnik odstranjen iz seznama

**Množično brisanje (BULK DELETE)**:
1. Označi več uporabnikov (checkboxes)
2. Klikni "Izbriši (X)" gumb
3. Potrdi brisanje
4. Preveri, ali so vsi izbrani uporabniki izbrisani

**Množična posodobitev organizacije (BULK UPDATE)**:
1. Označi več uporabnikov
2. Izberi organizacijo iz dropdown menija "Premakni v organizacijo..."
3. Preveri, ali so uporabniki premaknjeni

## Znane omejitve

### 1. MySQL baza ni integrirana
**Problem**: MySQL tabela `profiles` ni povezana s Supabase PostgreSQL.

**Razlogi**:
- Supabase Edge Functions ne morejo direktno dostopati do MySQL baze
- Sandbox okolje ne podpira trajnih backend procesov za MySQL API server

**Možne rešitve**:
- **Opcija A**: Uporabljati Supabase PostgreSQL kot primarno bazo za uporabnike (trenutna implementacija)
- **Opcija B**: Kreirati custom Node.js API server za MySQL (zahteva zunanje gostovanje)
- **Opcija C**: Migrirati MySQL podatke v Supabase PostgreSQL

### 2. Kreiranje uporabnika zahteva email potrditev
**Problem**: Pri ustvarjanju novega uporabnika preko `supabase.auth.signUp()` se pošlje email za potrditev.

**Rešitev**: V produkciji uporabiti Supabase Admin API z service role key za avtomatsko potrditev.

### 3. Brisanje uporabnika
**Problem**: Trenutna implementacija briše samo profil iz tabele `profiles`, ne pa tudi iz Supabase Auth.

**Rešitev**: Za popolno brisanje je potreben Supabase Admin API klic (zahteva service role key).

## Priporočila

### Za produkcijsko okolje

1. **Deployati Supabase Edge Functions z pravilnimi Admin API klici**
   - Omogočiti kreiranje uporabnikov brez email potrditve
   - Implementirati pravilno brisanje uporabnikov (Auth + Profile)
   
2. **Nastaviti RLS (Row Level Security) politike**
   - Omejiti dostop do `profiles` tabele samo za admin in super_admin
   - Preprečiti uporabnikom brisanje samih sebe

3. **Dodati error handling**
   - Prikazati uporabniku jasne napake
   - Log napak za debugging

4. **Optimizirati bulk operacije**
   - Uporabiti batch API klice namesto zank
   - Dodati progress indicator

### Za MySQL integracijo (opcijsko)

Če želite integrirati MySQL bazo:

1. **Kreirati custom Node.js API server**
   - Lokacija: `/workspace/s-app-mysql/server/api-profiles.js` (že kreiran)
   - Zahteva: Express, mysql2, cors paketi
   - Endpoints: GET, POST, PATCH, DELETE /api/profiles

2. **Posodobiti SuperAdminPage**
   - Zamenjati Supabase klice z fetch klici na MySQL API
   - Primer: `fetch('/api/profiles')` namesto `supabase.from('profiles')`

3. **Deployati API server**
   - Zahteva zunanje gostovanje (Heroku, Railway, DigitalOcean, itd.)
   - Nastaviti CORS za dovoljenje klicev iz frontend app-a

## Dodatne datoteke

- **MySQL API Server**: `/workspace/s-app-mysql/server/api-profiles.js`
- **Package.json**: `/workspace/s-app-mysql/server/package.json`
- **Test script**: `/workspace/s-app-mysql/test-supabase-profiles.mjs`
- **Migracija script**: `/workspace/s-app-mysql/migrate-mysql-to-supabase.mjs`

## Povzetek

✅ **OPRAVLJENO**:
- Posodobljen SuperAdminPage za uporabo direktnih Supabase query
- Odstranjeni klici na edge functions
- Implementirane vse CRUD operacije (Create, Read, Update, Delete)
- Implementirano iskanje in filtriranje
- Build in deployment uspešen
- Testiranje Supabase povezljivosti uspešno

⚠️ **OPOZORILO**:
- MySQL baza ni integrirana (trenutno se uporablja Supabase PostgreSQL)
- Za popolno integracijo MySQL je potreben custom API server

🎯 **PRIPOROČILO**:
- Uporabljati Supabase PostgreSQL kot primarno bazo za uporabnike
- Migrirati podatke iz MySQL v Supabase PostgreSQL (če je potrebno)
- Za MySQL integracijo deployati custom API server na zunanje gostovanje

---

**Avtorji dokumentacije**: Matrix Agent  
**Datum**: 2025-11-30  
**Verzija**: 1.0
