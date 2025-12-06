-- Preveri če admin obstaja
SELECT 'Trenutni admin:' as info, email, full_name, role FROM profiles WHERE email = 'admin@standario.com';

-- Če ne obstaja, ga ustvari
INSERT IGNORE INTO profiles (id, email, full_name, role, is_active, created_at, updated_at)
VALUES (
  'admin-user-001',
  'admin@standario.com',
  'Administrator',
  'super_admin',
  1,
  NOW(),
  NOW()
);

-- Preveri rezultat
SELECT 'Po vstavku:' as info, email, full_name, role FROM profiles WHERE email = 'admin@standario.com';
