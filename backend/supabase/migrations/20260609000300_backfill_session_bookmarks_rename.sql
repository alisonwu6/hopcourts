alter table if exists public.event_bookmarks rename to session_bookmarks;

do $$ begin
  if exists (select 1 from pg_indexes where indexname = 'event_bookmarks_user_id_idx') then
    alter index public.event_bookmarks_user_id_idx rename to session_bookmarks_user_id_idx;
  end if;
end $$;
