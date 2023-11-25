insert into todos (task)  values ('Task One');
insert into todos (task)  values ('Another Task');
insert into todos (task)  values ('Another Third Task');
insert into todos (task)  values ('A fourth task');
insert into todos (task)  values ('A fifth task');

insert into eisenhower(task_id, order_id) values (1, 0);
insert into eisenhower(task_id, order_id) values (2, 1);
insert into eisenhower(task_id, order_id, priority) values (3, 0, 'do_later');
insert into eisenhower(task_id, order_id, priority) values (4, 1, 'do_later');
insert into eisenhower(task_id, order_id, priority) values (5, 0, 'dont_do');

