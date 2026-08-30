ALTER TABLE public.learn_blocks DROP CONSTRAINT IF EXISTS learn_blocks_tab_check;
ALTER TABLE public.learn_blocks ADD CONSTRAINT learn_blocks_tab_check
  CHECK (tab IN ('models','privacy','local','agents','glossary','about'));