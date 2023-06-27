-- todo: handle states

insert into auth.users (id) values ('8122fefc-8817-4db7-bb91-5bc7f2116f7d');

insert into public.tasks (id, name, duration, user_id, importance) 
values (1, 'Walk the dog', '1hr 30min', '8122fefc-8817-4db7-bb91-5bc7f2116f7d', 'low');

insert into public.tasks(id, name, due_date, description, user_id, extra)
values (2, 'Finish Social Studies Project', current_date + 3, 'Get the social studies project ready to present',  '8122fefc-8817-4db7-bb91-5bc7f2116f7d', '30min');

insert into public.tasks (id, name, due_date, duration, description, user_id, importance, user_urgency, extra, additional_duration)
values (
  3,
  'Reflection',
  current_date,
  '45min',
  'I want to do a reflection before it gets to late in the day. I MUST stay in my mindful state so that I can success in my achievement goals',
  '8122fefc-8817-4db7-bb91-5bc7f2116f7d',
  'high',
  'high',
  '15min',
  '10min'
);

insert into public.steps  (id, task_id, name, completed)
values (1, 3, 'Get into mindset', false);

insert into public.steps  (id, task_id, name, completed)
values (2, 3, 'Get resolve blockers', false);

insert into public.steps  (id, task_id, name, completed)
values (3, 3, 'Motivate to work', false);

insert into public.steps (id, task_id, name, completed)
values (4, 3, 'Reflection', false);



/* Add some objectives */

insert into public.objectives (id, user_id, name, importance)
values (1, '8122fefc-8817-4db7-bb91-5bc7f2116f7d', 'Mindfullness', 'high');

insert into public.objectives (id, user_id, name, importance)
values (2, '8122fefc-8817-4db7-bb91-5bc7f2116f7d', 'College Application', 'high');

insert into public.objectives (id, user_id, name, importance)
values (3, '8122fefc-8817-4db7-bb91-5bc7f2116f7d', 'Beta Testing', 'high');

insert into public.task_objectives
values (1, 1);
insert into public.task_objectives
values (3, 1);

insert into public.task_objectives
values (3, 2);


-- Add a prioritized task; This is not specified on the DB, but is part of the ORM

insert into public.tasks (id, name, due_date, duration, description, user_id, importance, user_urgency, extra)
values (
  5,
  'Seed the database',
  current_date,
  '2h',
  'This should be easy but it really is not',
  '8122fefc-8817-4db7-bb91-5bc7f2116f7d',
  'high',
  'high',
  '30min'
);



/* Add some tasks in the planned state */

insert into public.tasks (id, name, due_date, duration, user_id, importance, user_urgency, extra)
values (
  4,
  'Work on the database schema',
  current_date,
  '45min',
  '8122fefc-8817-4db7-bb91-5bc7f2116f7d',
  'high',
  'low',
  '15min'
);
insert into public.planned_tasks
values (
  4,
  1,
  current_date
);


-- This should not work! it doesn't now
-- insert into public planned_tasks
-- values (
--   3,
--   1,
--   current_date
-- );



insert into public.planned_tasks
values (
  3,
  2,
  current_date
);

-- Add some tasks to the working state

insert into public.working_tasks
values (
  3,
  now() - interval '1h'
);
insert into public.working_tasks_working_step
values (
  1,
  now() - interval '1h'
);

-- Add some tasks to the completed state with working block
-- insert two working blocks and a completed state

insert into public.work_blocks (id, task_id, work_start, work_end, ended_by_completion)
values (
  1,
  2,
  now() - interval '3h 30m',
  now() - interval '3h',
  false
);

insert into public.work_blocks (id, task_id, work_start, work_end, ended_by_completion)
values (
  2,
  2,
  now() - interval '2h 30m',
  now() - interval '2h',
  true
);

insert into public.completed_tasks (task_id, reflection)
values (
  2,
  'it was aiiight'
);

