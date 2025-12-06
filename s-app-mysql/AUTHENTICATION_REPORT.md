**GESPRE ZA TESTIRANJE (doda na console):**

Demo besedilo za testiranje:
```
Email: admin@standario.com
Geslo: Demo2025!
```

✅ **POPRAVLJENO:**
- admin@standario.com - HAS_PASSWORD
- demo@standario.com - HAS_PASSWORD

⚠️ **PROBLEM:**
- Aplikacija vsebuje mešanico Supabase in MySQL
- Uporabniki se morda ne morejo prijaviti zaradi wrapper sistema
- Console log prikazuje: "Using MySQL database - no Supabase configuration needed"

## **REŠITVI:**

### **1. HITRA REŠITEV - Demo način**
Uporabite aplikacijo v demo načinu:
- URL: https://g0fnq6ihwqud.space.minimax.io?demo=true
- V demo načinu se prijava ne izvaja

### **2. POPOLNA REŠITEV - MySQL refactoring**
Potrebna je popolna migracija vseh komponent na MySQL:
- Refactoring 50+ komponent
- Odstranitev vseh supabase importov
- Implementacija MySQL API klicev
- Testiranje celotne aplikacije

**Pripravljen za izvedbo?** Če želite, lahko izvedem popolno migracijo na MySQL (traja ~2 uri).
