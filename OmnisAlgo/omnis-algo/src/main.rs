

fn main() {
    println!("Hello from rust!")
}


#[derive(PartialEq, Eq, PartialOrd, Ord, Debug, Clone, Copy)]
enum Importance {
    Low=2,
    High=1
}

#[derive(Clone, Debug, PartialEq, Eq)]
struct Task {
    name: String,
    importance: Importance,
    due_date: i32, 
    duration: i32,
}


fn order_tasks(tasks: &Vec<Task>) -> Vec<Task> {
    let mut ordered_tasks: Vec<Task> = tasks.clone();
    ordered_tasks.sort_by_key(|task| (-(task.importance as i32), -task.due_date));
    // TODO: figure out reverse
    ordered_tasks.reverse();

    return ordered_tasks
}

#[derive(Clone, Debug, PartialEq, Eq)]
struct ScheduledTask {
    task: Task,
    start_time: i32,
}

fn schedule_tasks(tasks: &Vec<Task>, start_time: i32) -> Vec<ScheduledTask> {
    let mut scheduled_tasks: Vec<ScheduledTask> = Vec::new();

    let mut time: i32 = start_time;

    for task in tasks {
        scheduled_tasks.push(
            ScheduledTask {
                task: task.clone(),
                start_time: time
            }
        );
        time += task.duration
    }

    return scheduled_tasks
}

#[derive(Clone, Debug, PartialEq, Eq)]
struct Obstacle {
    start_time: i32,
    end_time: i32,
}

fn adjust_for_obstacles(scheduled_tasks: &Vec<ScheduledTask>, obstacles: &Vec<Obstacle>) -> Vec<ScheduledTask> {
    let mut accumulated_timing = 0;
    let mut new_scheduled_tasks: Vec<ScheduledTask> = Vec::new();

    for task in scheduled_tasks {
        let mut new_task = task.clone();
        new_task.start_time += accumulated_timing; // TODO: use some FP for this

        // Find obstacle that overlaps with the task
        let obstacle = obstacles.iter().find(|obs| obs.end_time >= new_task.start_time && new_task.start_time >= obs.start_time ||
            obs.end_time > new_task.start_time + new_task.task.duration && new_task.start_time + new_task.task.duration > obs.start_time ||
            new_task.start_time <= obs.start_time && new_task.start_time + new_task.task.duration >= obs.end_time
        );


        match obstacle {
            Some(obs) => {
                new_task.start_time = obs.end_time;
                accumulated_timing += obs.end_time - task.start_time;
            },
            None => {}
        }

        new_scheduled_tasks.push(new_task)

    }

    return new_scheduled_tasks
}



#[cfg(test)]
mod tests {
    use super::*;

    use super::Importance::*;

    #[test]
    fn algo_test() {
        let input_tasks: Vec<Task> = vec![
            Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 },
            Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 },
            Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 },
            Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 },
        ];

        let expected_output = vec![
            Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 },
            Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 },
            Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 },
            Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 },
        ];

        let ordered_tasks = order_tasks(&input_tasks);

        assert_eq!(ordered_tasks, expected_output)
    }

    #[test]
    fn scheduled_test() {
        let ordered_tasks = vec![
            Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 },
            Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 },
            Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 },
            Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 },
        ];

        let expected_output = vec![
            ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
            ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 2 },
            ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 5 },
            ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 6 },
        ];

        let scheduled_tasks = schedule_tasks(&ordered_tasks, 0);

        assert_eq!(scheduled_tasks, expected_output)
    }

    #[test]
    fn schedule_with_obstacles_start_date() {
        let ordered_tasks = vec![
            ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },  
            ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 2 },
            ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 5 },
            ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 6 },
        ];

        let obstacles = vec![
            Obstacle { start_time: 2, end_time: 4 },
        ];

        let expected_output = vec![
            ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
            ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 4 },
            ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 7 },
            ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 8 },
        ];

        assert_eq!(adjust_for_obstacles(&ordered_tasks, &obstacles), expected_output)
    }

    #[test]
    fn schedule_with_obstacles_start_and_end_side() {
        let ordered_tasks = vec![
            ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },  
            ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 2 },
            ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 5 },
            ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 6 },
        ];

        let obstacles = vec![
            Obstacle { start_time: 3, end_time: 4 },
        ];

        let expected_output = vec![
            ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
            ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 4 },
            ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 7 },
            ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 8 },
        ];

        assert_eq!(adjust_for_obstacles(&ordered_tasks, &obstacles), expected_output)
    }

    #[test]
    fn schedule_with_obstacles_end_overlap() {
        let ordered_tasks = vec![
            ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },  
            ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 2 }, start_time: 2 },
            ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 4 },
            ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 5 },
        ];

        let obstacles = vec![
            Obstacle { start_time: 3, end_time: 5 },
        ];

        let expected_output = vec![
            ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
            ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 2 }, start_time: 5 },
            ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 7 },
            ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 8 },
        ];

        assert_eq!(adjust_for_obstacles(&ordered_tasks, &obstacles), expected_output)
    }
}
