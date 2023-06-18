create table "public"."goals" (
    "id" uuid not null,
    "user_id" uuid not null,
    "name" text not null,
    "importance" text not null,
    "description" text
);


alter table "public"."goals" enable row level security;

CREATE UNIQUE INDEX "Goals_pkey" ON public.goals USING btree (id);

alter table "public"."goals" add constraint "Goals_pkey" PRIMARY KEY using index "Goals_pkey";

alter table "public"."goals" add constraint "goals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."goals" validate constraint "goals_user_id_fkey";


