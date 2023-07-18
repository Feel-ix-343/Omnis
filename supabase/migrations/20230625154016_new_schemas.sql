create type levels as enum('high', 'low');

CREATE Table tasks (
  id int primary key,
  name text not null,
  description text,
  duration interval,
  due_date date,
  user_id uuid references auth.users not null,
  importance levels,
  user_urgency levels,
  extra interval,
  additional_duration interval
);

create table objectives (
  id int primary key,
  user_id uuid references auth.users not null,
  description text,
  name text not null,
  importance levels not null
);

/* Many to many */
create table task_objectives (
  task_id int references public.tasks on delete cascade,
  objective_id int references public.objectives,
  primary key(task_id, objective_id)
);

/* Many steps to one task */
create table steps (
  id int primary key,
  task_id int references public.tasks on delete cascade,
  name text not null,
  description text,
  planedDuration interval,
  completed boolean not null
);

comment on table steps is 'these are very freeform and completion is by the reference of the task';

/* Child of task; state of task */
create table planned_tasks (
  task_id int references public.tasks on delete cascade not null,
  daily_agenda_index int not null,
  scheduled_date date not null,
  primary key(scheduled_date, daily_agenda_index)
);

/* The currently working task. This one has everything relevant to time tracking */
create table working_tasks (
  task_id int references public.tasks on delete cascade primary key,
  start timestamptz not null
);
create table working_tasks_working_step ( /* one to one; can this be a feild? */
  working_step_id int references public.steps on delete cascade primary key,
  working_step_start_time timestamptz
);

/* Will you need to statify the completion? */

/* This is generated when a working task is stopped or completed */
create table work_blocks (
  id int primary key,
  task_id int references public.tasks on delete cascade not null,
  work_start timestamptz not null,
  work_end timestamptz not null,
  actual_additional_duration interval,
  planned_extra interval,
  planned_additional_duration interval,
  ended_by_completion boolean not null
);
comment on column work_blocks.planned_extra is 'Not sure how this will be used, but I would not want the data to be lost';
comment on column work_blocks.planned_additional_duration is 'Not sure how this will be used, but I would not want the data to be lost';

/* THis object will reference step blocks from above as well */

create table step_blocks ( /* Not specific to working task, but relevant to it hence position */
  id int primary key,
  step_id int references public.steps on delete cascade,
  block_start timestamptz not null,
  block_end timestamptz not null,
  work_block int references public.work_blocks(id) not null,
  closed_by_completion boolean not null
);

comment on column step_blocks.closed_by_completion is 'This is helpful for the work blocks';

/* If you go over time on a step, first it removes from extra time, but then it starts to push back the task time (its important that the algo does this so that the person doens't have to think about it and they can be immersed in flow) */



create table completed_tasks (
  task_id int references public.tasks on delete cascade primary key  not null,
  reflection text,
  realized_importance_score int check (realized_importance_score >= 0 and realized_importance_score <= 10),
  realized_urgency_score int check (realized_urgency_score >= 0 and realized_urgency_score <= 10),
  realized_estimation_score int check (realized_estimation_score >= 0 and realized_estimation_score <= 10),
  realized_pride_score int check (realized_pride_score >= 0 and realized_pride_score <= 10)
);
/* There may be some dangling uncompleted steps even on a completed task, but these can be moved to a new task by the client */
/* The view will also use the work_blocks for more analytics such as completed time. May want to do caching with this */

create table states (
  state_id int primary key,
  table_name text not null
);

create table state_history (
  user_id uuid references auth.users not null,
  from_state int references public.states not null,
  to_state int references public.states not null check (to_state != from_state),
  time timestamptz not null
);
comment on table state_history is 'This is mainly used to quickly determine where to find a tasks data, and for other analytics and such';
