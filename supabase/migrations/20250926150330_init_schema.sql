CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  letter text NOT NULL,
  transliteration text,
  status text NOT NULL DEFAULT 'created',
  xp_reward int NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- Optional helper for demo: simple piecewise level function
CREATE OR REPLACE FUNCTION public.compute_level(p_xp int)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_xp < 100 THEN 1
    WHEN p_xp < 300 THEN 2
    WHEN p_xp < 600 THEN 3
    WHEN p_xp < 1000 THEN 4
    WHEN p_xp < 1500 THEN 5
    ELSE 6
  END;
$$;