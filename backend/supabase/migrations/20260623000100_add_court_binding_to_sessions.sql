alter table public.sessions
  add column if not exists court_id text,
  add column if not exists court_name text;

update public.sessions s
set
  court_id = coalesce(space.value->>'id', space.value->>'name'),
  court_name = space.value->>'name'
from public.venues v
join public.venue_profiles vp on vp.venue_id = v.id
cross join lateral jsonb_array_elements(coalesce(vp.spaces, '[]'::jsonb)) as space(value)
where s.venue_id = v.id
  and s.court_id is null
  and space.value ? 'name'
  and s.place_name = concat(coalesce(v.name_display, v.name), ' - ', space.value->>'name');

create index if not exists sessions_venue_court_starts_idx
  on public.sessions (venue_id, court_id, starts_at);
