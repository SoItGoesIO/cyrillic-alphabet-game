-- XP + Leveling RPCs (safe to re-run)

-- 1) Deterministic level thresholds
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

-- 2) Atomic: complete item + award XP
create or replace function public.complete_item(p_item_id uuid)
returns table (new_total_xp int, new_level int, reward int, item_id uuid)
language plpgsql
security definer
as $$
declare
  v_uid uuid := auth.uid();
  v_reward int;
  v_total int;
  v_level int;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.items
     set status = 'completed',
         completed_at = now()
   where id = p_item_id
     and user_id = v_uid
     and status <> 'completed'
  returning xp_reward into v_reward;

  if not found then
    raise exception 'Item not found, already completed, or not yours';
  end if;

  update public.profiles p
     set total_xp = coalesce(total_xp,0) + coalesce(v_reward,0),
         level    = compute_level(coalesce(total_xp,0) + coalesce(v_reward,0))
   where p.user_id = v_uid
  returning total_xp, level into v_total, v_level;

  return query select v_total, v_level, v_reward, p_item_id;
end;
$$;

-- 3) RLS sanity (no-ops if already present)
create policy if not exists "items_owner_all" on public.items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy if not exists "profiles_owner_rw" on public.profiles
  for select, update using (user_id = auth.uid()) with check (user_id = auth.uid());
