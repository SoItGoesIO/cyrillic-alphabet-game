-- XP + Leveling RPCs (safe to re-run)

-- Ensure enum values exist (harmless if already present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type t WHERE t.typname = 'item_status') THEN
    ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'created';
    ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'in_progress';
    ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'completed';
  END IF;
END $$;

-- Level thresholds
create or replace function public.compute_level(p_xp int)
returns int language sql immutable as $$
  select case
    when p_xp < 100 then 1
    when p_xp < 250 then 2
    when p_xp < 500 then 3
    when p_xp < 900 then 4
    when p_xp < 1400 then 5
    else 6 + ((p_xp - 1400)/500)
  end
$$;

-- Atomic: complete item + award XP (keeps RLS; uses caller via auth.uid())
create or replace function public.complete_item(p_item_id uuid)
returns table (new_total_xp int, new_level int, reward int, item_id uuid)
language plpgsql
security definer
set search_path = public
as $$
DECLARE
  v_uid uuid := auth.uid();
  v_reward int;
  v_total int;
  v_level int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.items
     SET status = 'completed',
         completed_at = now()
   WHERE id = p_item_id
     AND user_id = v_uid
     AND status <> 'completed'
  RETURNING xp_reward INTO v_reward;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found, already completed, or not yours';
  END IF;

  UPDATE public.profiles p
     SET total_xp = COALESCE(total_xp,0) + COALESCE(v_reward,0),
         level    = compute_level(COALESCE(total_xp,0) + COALESCE(v_reward,0))
   WHERE p.user_id = v_uid
  RETURNING total_xp, level INTO v_total, v_level;

  RETURN QUERY SELECT v_total, v_level, v_reward, p_item_id;
END;
$$;

-- Safer grants
REVOKE ALL ON FUNCTION public.complete_item(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_item(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_level(int) TO authenticated;

-- RLS policies (create if missing)
DO $$
BEGIN
  BEGIN
    CREATE POLICY items_owner_all ON public.items
      FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'items_owner_all already exists';
  END;

  BEGIN
    CREATE POLICY profiles_owner_rw ON public.profiles
      FOR SELECT, UPDATE
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'profiles_owner_rw already exists';
  END;
END $$;
