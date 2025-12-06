# Super Admin Dashboard - MySQL Integration Problem

## Problem
- SuperAdminPage uporablja Supabase edge functions (`admin-users`, `admin-organizations`)
- Edge functions dostopajo do **Supabase PostgreSQL** `profiles` tabele
- MySQL `profiles` tabela obstaja z 8 zapisi, vendar **ni povezana** s Supabase
- Novi zapisi iz SuperAdminPage se NE shranjujejo v MySQL

## Arhitektura
```
Frontend (SuperAdminPage) 
  ↓
Supabase Edge Functions (admin-users)
  ↓
Supabase PostgreSQL (profiles tabela)

LOČENO:
MySQL Database (profiles tabela) - 8 zapisov, ni sinhronizacije
```

## Rešitve

### Option A: Uporaba Supabase PostgreSQL (PRIPOROČENO)
- Deployati edge functions na Supabase
- Uporabljati Supabase PostgreSQL kot primarno bazo za uporabnike
- MySQL tabela ostane za drugo funkcionalnost

### Option B: Direktna MySQL integracija
- Kreirati custom Node.js API endpoint
- API endpoint uporablja MySQL2 knjižnico
- SuperAdminPage kliče ta API namesto edge functions

### Option C: Sinhronizacija
- Deployati edge functions (Supabase PostgreSQL)
- Kreirati cron job za sinhronizacijo Supabase → MySQL

## Trenutno stanje
- Edge functions niso deployani
- SuperAdminPage v produkcijskem načinu ne deluje
- Demo mode (?demo=true) uporablja mock podatke

## Priporočilo
Uporabiti **Option A** - Supabase PostgreSQL kot primarno bazo:
1. Deployati edge functions
2. Dodati profili v Supabase PostgreSQL
3. SuperAdminPage bo deloval preko edge functions
