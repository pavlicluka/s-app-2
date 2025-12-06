-- Posodobi uporabnike z gesli
UPDATE profiles 
SET password_hash = 'a6286dbfc32619dd328c47d1fd343ef8fc0fb0e1001ea844647e24c7a8cd3469' 
WHERE email = 'admin@standario.com';

UPDATE profiles 
SET password_hash = 'a6286dbfc32619dd328c47d1fd343ef8fc0fb0e1001ea844647e24c7a8cd3469' 
WHERE email = 'demo@standario.com';

-- Preveri rezultat
SELECT email, full_name, role, 
       CASE 
         WHEN password_hash IS NOT NULL THEN 'HAS_PASSWORD' 
         ELSE 'NO_PASSWORD' 
       END as password_status
FROM profiles 
WHERE email IN ('admin@standario.com', 'demo@standario.com');