-- Cyrillic Letters Integration
-- Creates RPC functions to initialize and manage Cyrillic letter learning items

-- Function to get letter difficulty and XP reward
CREATE OR REPLACE FUNCTION public.get_letter_xp(letter_cyrillic text)
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE letter_cyrillic
    -- Easy letters (similar to English) - 5 XP
    WHEN 'А' THEN 5 WHEN 'Е' THEN 5 WHEN 'К' THEN 5 WHEN 'М' THEN 5
    WHEN 'О' THEN 5 WHEN 'Т' THEN 5
    -- Medium letters (moderate difference) - 10 XP
    WHEN 'Б' THEN 10 WHEN 'В' THEN 10 WHEN 'Г' THEN 10 WHEN 'Д' THEN 10
    WHEN 'И' THEN 10 WHEN 'Л' THEN 10 WHEN 'Н' THEN 10 WHEN 'П' THEN 10
    WHEN 'Р' THEN 10 WHEN 'С' THEN 10 WHEN 'У' THEN 10 WHEN 'Ф' THEN 10
    -- Hard letters (very different/unique sounds) - 15 XP
    WHEN 'Ж' THEN 15 WHEN 'З' THEN 15 WHEN 'Й' THEN 15 WHEN 'Ц' THEN 15
    WHEN 'Ч' THEN 15 WHEN 'Ш' THEN 15 WHEN 'Щ' THEN 15 WHEN 'Ы' THEN 15
    WHEN 'Э' THEN 15 WHEN 'Ю' THEN 15 WHEN 'Я' THEN 15
    -- Very hard letters (signs and complex sounds) - 20 XP
    WHEN 'Ё' THEN 20 WHEN 'Х' THEN 20 WHEN 'Ъ' THEN 20 WHEN 'Ь' THEN 20
    ELSE 10 -- Default
  END;
END;
$$;

-- Function to initialize Cyrillic letters for a user
CREATE OR REPLACE FUNCTION public.initialize_cyrillic_letters(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  letter_data record;
BEGIN
  -- Check if user already has letters initialized
  IF EXISTS (
    SELECT 1 FROM public.items
    WHERE user_id = p_user_id
    AND letter IS NOT NULL
    LIMIT 1
  ) THEN
    RETURN; -- Already initialized
  END IF;

  -- Insert all 33 Cyrillic letters
  INSERT INTO public.items (user_id, letter, transliteration, status, xp_reward, created_at)
  VALUES
    (p_user_id, 'А', 'A', 'created', get_letter_xp('А'), now()),
    (p_user_id, 'Б', 'B', 'created', get_letter_xp('Б'), now()),
    (p_user_id, 'В', 'V', 'created', get_letter_xp('В'), now()),
    (p_user_id, 'Г', 'G', 'created', get_letter_xp('Г'), now()),
    (p_user_id, 'Д', 'D', 'created', get_letter_xp('Д'), now()),
    (p_user_id, 'Е', 'E', 'created', get_letter_xp('Е'), now()),
    (p_user_id, 'Ё', 'Yo', 'created', get_letter_xp('Ё'), now()),
    (p_user_id, 'Ж', 'Zh', 'created', get_letter_xp('Ж'), now()),
    (p_user_id, 'З', 'Z', 'created', get_letter_xp('З'), now()),
    (p_user_id, 'И', 'I', 'created', get_letter_xp('И'), now()),
    (p_user_id, 'Й', 'Y', 'created', get_letter_xp('Й'), now()),
    (p_user_id, 'К', 'K', 'created', get_letter_xp('К'), now()),
    (p_user_id, 'Л', 'L', 'created', get_letter_xp('Л'), now()),
    (p_user_id, 'М', 'M', 'created', get_letter_xp('М'), now()),
    (p_user_id, 'Н', 'N', 'created', get_letter_xp('Н'), now()),
    (p_user_id, 'О', 'O', 'created', get_letter_xp('О'), now()),
    (p_user_id, 'П', 'P', 'created', get_letter_xp('П'), now()),
    (p_user_id, 'Р', 'R', 'created', get_letter_xp('Р'), now()),
    (p_user_id, 'С', 'S', 'created', get_letter_xp('С'), now()),
    (p_user_id, 'Т', 'T', 'created', get_letter_xp('Т'), now()),
    (p_user_id, 'У', 'U', 'created', get_letter_xp('У'), now()),
    (p_user_id, 'Ф', 'F', 'created', get_letter_xp('Ф'), now()),
    (p_user_id, 'Х', 'Kh', 'created', get_letter_xp('Х'), now()),
    (p_user_id, 'Ц', 'Ts', 'created', get_letter_xp('Ц'), now()),
    (p_user_id, 'Ч', 'Ch', 'created', get_letter_xp('Ч'), now()),
    (p_user_id, 'Ш', 'Sh', 'created', get_letter_xp('Ш'), now()),
    (p_user_id, 'Щ', 'Shch', 'created', get_letter_xp('Щ'), now()),
    (p_user_id, 'Ъ', '"', 'created', get_letter_xp('Ъ'), now()),
    (p_user_id, 'Ы', 'Y', 'created', get_letter_xp('Ы'), now()),
    (p_user_id, 'Ь', '''', 'created', get_letter_xp('Ь'), now()),
    (p_user_id, 'Э', 'E', 'created', get_letter_xp('Э'), now()),
    (p_user_id, 'Ю', 'Yu', 'created', get_letter_xp('Ю'), now()),
    (p_user_id, 'Я', 'Ya', 'created', get_letter_xp('Я'), now());

END;
$$;

-- Function to complete a specific letter (by cyrillic character)
CREATE OR REPLACE FUNCTION public.complete_letter(p_letter text)
RETURNS table (new_total_xp int, new_level int, reward int, item_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_reward int;
  v_total int;
  v_level int;
  v_item_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find and complete the letter item
  UPDATE public.items
     SET status = 'completed',
         completed_at = now()
   WHERE user_id = v_uid
     AND letter = p_letter
     AND status <> 'completed'
  RETURNING id, xp_reward INTO v_item_id, v_reward;

  IF NOT FOUND THEN
    -- Try to create the letter if it doesn't exist
    INSERT INTO public.items (user_id, letter, transliteration, status, xp_reward, completed_at)
    VALUES (
      v_uid,
      p_letter,
      CASE p_letter
        WHEN 'А' THEN 'A' WHEN 'Б' THEN 'B' WHEN 'В' THEN 'V' WHEN 'Г' THEN 'G'
        WHEN 'Д' THEN 'D' WHEN 'Е' THEN 'E' WHEN 'Ё' THEN 'Yo' WHEN 'Ж' THEN 'Zh'
        WHEN 'З' THEN 'Z' WHEN 'И' THEN 'I' WHEN 'Й' THEN 'Y' WHEN 'К' THEN 'K'
        WHEN 'Л' THEN 'L' WHEN 'М' THEN 'M' WHEN 'Н' THEN 'N' WHEN 'О' THEN 'O'
        WHEN 'П' THEN 'P' WHEN 'Р' THEN 'R' WHEN 'С' THEN 'S' WHEN 'Т' THEN 'T'
        WHEN 'У' THEN 'U' WHEN 'Ф' THEN 'F' WHEN 'Х' THEN 'Kh' WHEN 'Ц' THEN 'Ts'
        WHEN 'Ч' THEN 'Ch' WHEN 'Ш' THEN 'Sh' WHEN 'Щ' THEN 'Shch' WHEN 'Ъ' THEN '"'
        WHEN 'Ы' THEN 'Y' WHEN 'Ь' THEN '''' WHEN 'Э' THEN 'E' WHEN 'Ю' THEN 'Yu'
        WHEN 'Я' THEN 'Ya' ELSE p_letter
      END,
      'completed',
      get_letter_xp(p_letter),
      now()
    )
    RETURNING id, xp_reward INTO v_item_id, v_reward;
  END IF;

  -- Update user profile XP and level
  UPDATE public.profiles p
     SET total_xp = COALESCE(total_xp,0) + COALESCE(v_reward,0),
         level    = compute_level(COALESCE(total_xp,0) + COALESCE(v_reward,0))
   WHERE p.user_id = v_uid
  RETURNING total_xp, level INTO v_total, v_level;

  RETURN QUERY SELECT v_total, v_level, v_reward, v_item_id;
END;
$$;

-- Function to get user's letter progress
CREATE OR REPLACE FUNCTION public.get_letter_progress()
RETURNS table (
  letter text,
  transliteration text,
  status text,
  xp_reward int,
  completed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT i.letter, i.transliteration, i.status, i.xp_reward, i.completed_at
  FROM public.items i
  WHERE i.user_id = v_uid
    AND i.letter IS NOT NULL
  ORDER BY i.letter;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.get_letter_xp(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_letter_xp(text) TO authenticated;

REVOKE ALL ON FUNCTION public.initialize_cyrillic_letters(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.initialize_cyrillic_letters(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.complete_letter(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_letter(text) TO authenticated;

REVOKE ALL ON FUNCTION public.get_letter_progress() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_letter_progress() TO authenticated;