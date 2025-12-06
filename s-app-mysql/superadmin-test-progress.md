# Super Admin Dashboard - Testiranje MySQL Profiles Integration

## Test Plan
**Deployed URL**: https://u21ijn9rt7sl.space.minimax.io  
**Test Date**: 2025-11-30  
**Test Mode**: Demo mode (?demo=true)

## Posodobitve aplikacije
- ✅ Posodobljen SuperAdminPage za uporabo direktnih Supabase query
- ✅ Odstranjeni klici na edge functions (admin-users, admin-organizations)
- ✅ Implementirane CRUD operacije direktno na Supabase PostgreSQL
- ✅ Build in deployment uspešen

## Trenutno stanje Supabase PostgreSQL
- **Tabela**: profiles
- **Zapisi**: 5 profilov
  1. admin@standario.com - super_admin ✅
  2. demo@standario.com - user
  3. rcqmnhvf@minimax.com - admin
  4. thwnwrvj@minimax.com - admin
  5. demo.standario@minimax.com - admin

## Testni scenariji

### 1. Dostop do SuperAdminPage
- [ ] Dostop z demo modom (?demo=true)
- [ ] Dostop s super_admin računom
- [ ] Preverjanje prikaza uporabnikov in organizacij

### 2. Branje podatkov (READ)
- [ ] Nalaganje vseh uporabnikov
- [ ] Filtriranje po imenu/email-u
- [ ] Filtriranje po organizaciji
- [ ] Filtriranje po vlogi

### 3. Ustvarjanje novih profilov (CREATE)
- [ ] Ustvarjanje novega uporabnika
- [ ] Preverjanje ali se profil shrani v Supabase PostgreSQL
- [ ] Preverjanje vseh polj (email, full_name, role, organization_id)

### 4. Posodabljanje profilov (UPDATE)
- [ ] Urejanje obstoječega profila
- [ ] Sprememba imena
- [ ] Sprememba vloge
- [ ] Sprememba organizacije
- [ ] Preverjanje shranjevanja

### 5. Brisanje profilov (DELETE)
- [ ] Brisanje testnega profila
- [ ] Bulk brisanje (več profilov hkrati)
- [ ] Preverjanje potrditvenega dialoga

## Rezultati testiranja

**Status**: Začetek testiranja

