-- Gingko Writer Tree/Card System Migration
-- Adds tree-based document editing with hierarchical cards

-- Trees (documents)
CREATE TABLE public.trees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Document',
  description text,
  is_public boolean DEFAULT FALSE,
  archived boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Cards (nodes in the tree)
CREATE TABLE public.cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id uuid NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.cards(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  content_markdown text NOT NULL DEFAULT '',
  collapsed boolean DEFAULT FALSE,
  hidden_from_export boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- User settings for the Gingko Writer
CREATE TABLE public.gingko_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_export_format text DEFAULT 'md' CHECK (default_export_format IN ('md', 'docx', 'json')),
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  auto_save_enabled boolean DEFAULT TRUE,
  auto_save_interval_seconds integer DEFAULT 30,
  show_word_count boolean DEFAULT TRUE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_trees_user_updated ON public.trees (user_id, updated_at DESC);
CREATE INDEX idx_trees_user_archived ON public.trees (user_id, archived, updated_at DESC);
CREATE INDEX idx_cards_tree_parent ON public.cards (tree_id, parent_id, order_index);
CREATE INDEX idx_cards_tree_order ON public.cards (tree_id, order_index);
CREATE INDEX idx_cards_parent_order ON public.cards (parent_id, order_index);

-- Row Level Security
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gingko_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trees
CREATE POLICY "Users can view own trees" ON public.trees
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public trees" ON public.trees
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can manage own trees" ON public.trees
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for cards
CREATE POLICY "Users can view cards in accessible trees" ON public.cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = cards.tree_id
      AND (trees.user_id = auth.uid() OR trees.is_public = TRUE)
    )
  );

CREATE POLICY "Users can manage cards in own trees" ON public.cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = cards.tree_id
      AND trees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in own trees" ON public.cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = cards.tree_id
      AND trees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards in own trees" ON public.cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = cards.tree_id
      AND trees.user_id = auth.uid()
    )
  );

-- RLS Policies for gingko_settings
CREATE POLICY "Users can manage own gingko settings" ON public.gingko_settings
  FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamps (create if doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at triggers
CREATE TRIGGER update_trees_updated_at
  BEFORE UPDATE ON public.trees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_gingko_settings_updated_at
  BEFORE UPDATE ON public.gingko_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get tree depth/hierarchy
CREATE OR REPLACE FUNCTION get_card_depth(card_id uuid)
RETURNS integer AS $$
WITH RECURSIVE card_path AS (
  -- Base case: the card itself
  SELECT id, parent_id, 0 as depth
  FROM public.cards
  WHERE id = card_id

  UNION ALL

  -- Recursive case: traverse up the tree
  SELECT c.id, c.parent_id, cp.depth + 1
  FROM public.cards c
  INNER JOIN card_path cp ON c.id = cp.parent_id
)
SELECT COALESCE(MAX(depth), 0) FROM card_path;
$$ LANGUAGE sql STABLE;

-- Function to get all descendant cards
CREATE OR REPLACE FUNCTION get_card_descendants(card_id uuid)
RETURNS TABLE(id uuid, depth integer) AS $$
WITH RECURSIVE descendants AS (
  -- Base case: the card itself
  SELECT c.id, 0 as depth
  FROM public.cards c
  WHERE c.id = card_id

  UNION ALL

  -- Recursive case: find children
  SELECT c.id, d.depth + 1
  FROM public.cards c
  INNER JOIN descendants d ON c.parent_id = d.id
)
SELECT descendants.id, descendants.depth
FROM descendants
WHERE descendants.depth > 0;  -- Exclude the original card
$$ LANGUAGE sql STABLE;

-- Function to reorder cards within same parent
CREATE OR REPLACE FUNCTION reorder_cards(
  p_card_ids uuid[],
  p_parent_id uuid DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  card_id uuid;
  new_order integer := 0;
BEGIN
  -- Update order_index for each card in the provided order
  FOREACH card_id IN ARRAY p_card_ids
  LOOP
    UPDATE public.cards
    SET order_index = new_order,
        updated_at = NOW()
    WHERE id = card_id
    AND COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid) =
        COALESCE(p_parent_id, '00000000-0000-0000-0000-000000000000'::uuid);

    new_order := new_order + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to move card to new parent
CREATE OR REPLACE FUNCTION move_card(
  p_card_id uuid,
  p_new_parent_id uuid DEFAULT NULL,
  p_new_position integer DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  target_tree_id uuid;
  current_max_order integer;
BEGIN
  -- Get tree_id from the target parent (or source card if no parent)
  IF p_new_parent_id IS NOT NULL THEN
    SELECT tree_id INTO target_tree_id
    FROM public.cards
    WHERE id = p_new_parent_id;
  ELSE
    SELECT tree_id INTO target_tree_id
    FROM public.cards
    WHERE id = p_card_id;
  END IF;

  -- Get current max order_index for the target parent
  SELECT COALESCE(MAX(order_index), -1) INTO current_max_order
  FROM public.cards
  WHERE COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid) =
        COALESCE(p_new_parent_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND tree_id = target_tree_id
  AND id != p_card_id;

  -- Update the card
  UPDATE public.cards
  SET
    parent_id = p_new_parent_id,
    order_index = COALESCE(p_new_position, current_max_order + 1),
    updated_at = NOW()
  WHERE id = p_card_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for easy tree navigation
CREATE OR REPLACE VIEW tree_structure AS
WITH RECURSIVE tree_hierarchy AS (
  -- Root cards (no parent)
  SELECT
    t.id as tree_id,
    t.title as tree_title,
    c.id as card_id,
    c.parent_id,
    c.content_markdown,
    c.order_index,
    c.collapsed,
    c.hidden_from_export,
    0 as depth,
    ARRAY[c.order_index] as path
  FROM public.trees t
  JOIN public.cards c ON t.id = c.tree_id
  WHERE c.parent_id IS NULL

  UNION ALL

  -- Child cards
  SELECT
    th.tree_id,
    th.tree_title,
    c.id as card_id,
    c.parent_id,
    c.content_markdown,
    c.order_index,
    c.collapsed,
    c.hidden_from_export,
    th.depth + 1 as depth,
    th.path || c.order_index as path
  FROM tree_hierarchy th
  JOIN public.cards c ON th.card_id = c.parent_id
)
SELECT * FROM tree_hierarchy
ORDER BY tree_id, path;

-- Note: Seed data will be added after confirming the schema works

COMMENT ON TABLE public.trees IS 'Tree documents in the Gingko Writer system';
COMMENT ON TABLE public.cards IS 'Individual cards (nodes) within tree documents';
COMMENT ON TABLE public.gingko_settings IS 'User preferences for the Gingko Writer interface';