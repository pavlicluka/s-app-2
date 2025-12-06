# Website Testing Progress

## Test Plan
**Website Type**: MPA (Multi-Page Application)
**Deployed URL**: https://hsepva7y8xar.space.minimax.io
**Test Date**: 2025-11-30
**Verzija**: 2.0 - Z vsemi 40+ novimi prevodi

### Pathways to Test
- [ ] Navigacija in routing (glavna navigacija, podmeni)
- [ ] Responsive design (desktop/mobile)
- [ ] Prevodi (slovenščina/angleščina, novi ključi)
- [ ] Dashboard in vizualizacija podatkov
- [ ] GDPR Evidence obdelave
- [ ] ISO 27001 funkcionalnosti
- [ ] Inventar (Naprave, Programska oprema, Licence)
- [ ] NIS 2 - Evidenca tveganj (nova funkcionalnost s prevodi)

## Testing Progress

### Step 1: Pre-Test Planning
- Website complexity: Complex (MPA, več modulov, večjezičnost)
- Test strategy: Fokus na nove prevode in ključne funkcionalnosti

### Step 2: Comprehensive Testing
**Status**: Delno testirano - Brez prijave
- Tested: 
  - ✅ Aplikacija se pravilno naloži
  - ✅ UI je v slovenščini
  - ✅ Jezikovno stikalo DELUJE PRAVILNO (popravljeno!)
  - ✅ Vsi prevodi na prijavni strani delujejo (SL ↔ EN)
  - ❌ Ne morem dostopati do Dashboard in ostalih strani brez prijave
- Issues found: 1 (samo prijava potrebna)

### Step 3: Coverage Validation
- [X] Jezikovno stikalo testirano - USPEŠNO
- [ ] Vse glavne strani testirane - **BLOCKED: Potrebni prijavni podatki**
- [ ] Novi prevodi v Dashboard testirani - **BLOCKED: Potrebni prijavni podatki**
- [ ] GDPR usposabljanja prevodi testirani - **BLOCKED: Potrebni prijavni podatki**
- [ ] Inventory filtri testirani - **BLOCKED: Potrebni prijavni podatki**

### Step 4: Fixes & Re-testing
**Bugs Found**: 0 (jezikovno stikalo popravljeno)

| Bug | Type | Status | Re-test Result |
|-----|------|--------|----------------|
| Jezikovno stikalo ne deluje | Isolated | FIXED | PASS |

**Final Status**: Aplikacija deployirana in deluje. Jezikovno stikalo deluje. Za celovito testiranje novih prevodov potrebni prijavni podatki.
