alter table public.teachers enable row level security;

drop policy if exists "Allow public read teachers" on public.teachers;
drop policy if exists "Allow public insert teachers" on public.teachers;
drop policy if exists "Allow public update teachers" on public.teachers;

create policy "Allow public read teachers"
on public.teachers
for select
using (true);

create policy "Allow public insert teachers"
on public.teachers
for insert
with check (true);

create policy "Allow public update teachers"
on public.teachers
for update
using (true)
with check (true);
