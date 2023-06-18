alter table "public"."tasks" add column "goals" uuid[];

create policy "Only users can do things"
on "public"."goals"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



