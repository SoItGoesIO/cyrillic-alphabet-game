-- Sample SQL queries for Cyrillic Alphabet Game
-- Run these after your migrations are applied

-- 1. XP Level Testing
SELECT
  xp,
  compute_level(xp) as level,
  CASE
    WHEN compute_level(xp) = 1 THEN 'Beginner'
    WHEN compute_level(xp) = 2 THEN 'Novice'
    WHEN compute_level(xp) = 3 THEN 'Intermediate'
    WHEN compute_level(xp) = 4 THEN 'Advanced'
    WHEN compute_level(xp) = 5 THEN 'Expert'
    ELSE 'Master'
  END as rank
FROM (VALUES (0), (50), (100), (250), (500), (900), (1400), (2000), (3000)) AS t(xp)
ORDER BY xp;

-- 2. Create Cyrillic alphabet items (33 letters)
INSERT INTO items (id, user_id, letter, transliteration, status, xp_reward) VALUES
-- Vowels (10 XP each)
(gen_random_uuid(), auth.uid(), 'А', 'A', 'created', 10),
(gen_random_uuid(), auth.uid(), 'Е', 'E', 'created', 10),
(gen_random_uuid(), auth.uid(), 'Ё', 'YO', 'created', 15),
(gen_random_uuid(), auth.uid(), 'И', 'I', 'created', 10),
(gen_random_uuid(), auth.uid(), 'О', 'O', 'created', 10),
(gen_random_uuid(), auth.uid(), 'У', 'U', 'created', 10),
(gen_random_uuid(), auth.uid(), 'Ы', 'Y', 'created', 15),
(gen_random_uuid(), auth.uid(), 'Э', 'E', 'created', 15),
(gen_random_uuid(), auth.uid(), 'Ю', 'YU', 'created', 15),
(gen_random_uuid(), auth.uid(), 'Я', 'YA', 'created', 15),

-- Common consonants (10 XP each)
(gen_random_uuid(), auth.uid(), 'Б', 'B', 'created', 10),
(gen_random_uuid(), auth.uid(), 'В', 'V', 'created', 10),
(gen_random_uuid(), auth.uid(), 'Г', 'G', 'created', 10),
(gen_random_uuid(), auth.uid(), 'Д', 'D', 'created', 10),
(gen_random_uuid(), auth.uid(), 'К', 'K', 'created', 10),
(gen_random_uuid(), auth.uid(), 'Л', 'L', 'created', 10),
(gen_random_uuid(), auth.uid(), 'М', 'M', 'created', 10),
(gen_random_uuid(), auth.uid(), 'Н', 'N', 'created', 10),
(gen_random_uuid(), auth.uid(), 'П', 'P', 'created', 10),
(gen_random_uuid(), auth.uid(), 'Р', 'R', 'created', 10),
(gen_random_uuid(), auth.uid(), 'С', 'S', 'created', 10),
(gen_random_uuid(), auth.uid(), 'Т', 'T', 'created', 10),

-- Harder consonants (15 XP each)
(gen_random_uuid(), auth.uid(), 'Ж', 'ZH', 'created', 15),
(gen_random_uuid(), auth.uid(), 'З', 'Z', 'created', 15),
(gen_random_uuid(), auth.uid(), 'Й', 'Y', 'created', 15),
(gen_random_uuid(), auth.uid(), 'Ф', 'F', 'created', 15),
(gen_random_uuid(), auth.uid(), 'Х', 'KH', 'created', 15),
(gen_random_uuid(), auth.uid(), 'Ц', 'TS', 'created', 15),
(gen_random_uuid(), auth.uid(), 'Ч', 'CH', 'created', 15),
(gen_random_uuid(), auth.uid(), 'Ш', 'SH', 'created', 15),
(gen_random_uuid(), auth.uid(), 'Щ', 'SHCH', 'created', 20),

-- Special letters (20 XP each)
(gen_random_uuid(), auth.uid(), 'Ъ', '''', 'created', 20),  -- Hard sign
(gen_random_uuid(), auth.uid(), 'Ь', '''', 'created', 20)   -- Soft sign
ON CONFLICT DO NOTHING;

-- 3. Simulate learning progress
-- Complete some easy letters first
WITH easy_letters AS (
  SELECT id FROM items
  WHERE letter IN ('А', 'О', 'И', 'Е', 'М', 'Т')
  AND status = 'created'
  LIMIT 3
)
UPDATE items SET status = 'in_progress'
WHERE id IN (SELECT id FROM easy_letters);

-- 4. Check learning progress
SELECT
  COUNT(*) as total_letters,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN status = 'created' THEN 1 END) as not_started,
  ROUND(
    COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*),
    1
  ) as completion_percentage
FROM items
WHERE user_id = auth.uid();

-- 5. XP breakdown by difficulty
SELECT
  CASE
    WHEN xp_reward = 10 THEN 'Easy (10 XP)'
    WHEN xp_reward = 15 THEN 'Medium (15 XP)'
    WHEN xp_reward = 20 THEN 'Hard (20 XP)'
    ELSE 'Other'
  END as difficulty,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  SUM(CASE WHEN status = 'completed' THEN xp_reward ELSE 0 END) as xp_earned,
  SUM(xp_reward) as total_possible_xp
FROM items
WHERE user_id = auth.uid()
GROUP BY xp_reward
ORDER BY xp_reward;

-- 6. Leaderboard simulation (if multiple users)
SELECT
  user_id,
  total_xp,
  level,
  RANK() OVER (ORDER BY total_xp DESC) as rank
FROM profiles
WHERE total_xp > 0
ORDER BY total_xp DESC;

-- 7. Next level progress
WITH user_stats AS (
  SELECT
    total_xp,
    level,
    CASE
      WHEN level = 1 THEN 100
      WHEN level = 2 THEN 250
      WHEN level = 3 THEN 500
      WHEN level = 4 THEN 900
      WHEN level = 5 THEN 1400
      ELSE 1400 + ((level - 5) * 500)
    END as next_level_xp,
    CASE
      WHEN level = 1 THEN 0
      WHEN level = 2 THEN 100
      WHEN level = 3 THEN 250
      WHEN level = 4 THEN 500
      WHEN level = 5 THEN 900
      ELSE 1400 + ((level - 6) * 500)
    END as current_level_xp
  FROM profiles
  WHERE user_id = auth.uid()
)
SELECT
  level,
  total_xp,
  next_level_xp,
  (total_xp - current_level_xp) as progress_in_level,
  (next_level_xp - current_level_xp) as xp_needed_for_level,
  ROUND(
    (total_xp - current_level_xp) * 100.0 / (next_level_xp - current_level_xp),
    1
  ) as level_progress_percentage
FROM user_stats;