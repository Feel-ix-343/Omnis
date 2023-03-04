use std::ops::AddAssign;

use chrono::{DateTime, NaiveDate, NaiveDateTime, Timelike, Duration, Utc};

struct UserPreferences {
    /// Hour of the day that the user wants to start working. This should be in naive time
    start_time: NaiveDateTime,
    /// Hour of the day that the user wants to end working. This should be in naive time
    end_time: NaiveDateTime,
}

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
    /// Due date in days away from current date
    due_date: NaiveDate, 
    /// Duration in minutes
    duration: i64,
}


// TODO: Why would the first half of the tasks be high urgency and the second half low urgency? This seems abitrary.
fn tasks_to_urgency(tasks: &Vec<Task>) -> Vec<TaskWithUrgency> {
    let mut tasks_ordered_by_date: Vec<Task> = tasks.clone();
    tasks_ordered_by_date.sort_by_key(|task| task.due_date);

    // Map the first half of the tasks to high urgency and the second half to low urgency
    let tasks_with_urgency: Vec<TaskWithUrgency> = vec![
        tasks_ordered_by_date[0..tasks_ordered_by_date.len() / 2].to_vec().iter().map(|task| TaskWithUrgency{task: task.clone(), urgency: Urgency::High}).collect::<Vec<TaskWithUrgency>>(),
        tasks_ordered_by_date[tasks_ordered_by_date.len() / 2..].to_vec().iter().map(|task| TaskWithUrgency{task: task.clone(), urgency: Urgency::Low}).collect::<Vec<TaskWithUrgency>>(),
    ].into_iter().flatten().collect();

    return tasks_with_urgency
}

    
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Copy)]
enum Urgency {
    Low=2,
    High=1
}
    
#[derive(Clone, Debug, PartialEq, Eq)]
struct TaskWithUrgency {
    task: Task,
    urgency: Urgency,
}

fn order_tasks(tasks: &Vec<Task>) -> Vec<TaskWithUrgency> {
    let mut tasks_with_urgency: Vec<TaskWithUrgency> = tasks_to_urgency(tasks);

    // Sort tasks by importance, urgency and duration (based on user preference)
    tasks_with_urgency.sort_by_key(|task| (task.task.importance, task.urgency, task.task.duration)); // Sorts low to high

    return tasks_with_urgency
}

#[derive(Clone, Debug, PartialEq, Eq)]
struct ScheduledTask {
    task: Task,
    start_time: NaiveDateTime,
}


// I need to schedule tasks in a way that will be understandable in to the UI as date time form


/// This takes a list of tasks and the current time, and lays the tasks in a timeline from the current time
/// current_time takes date, hours, and minutes into account. TODO: Think about local time vs server time
/// Should convert from the data base time to NaiveDateTime
fn schedule_tasks(tasks: &Vec<Task>, current_time: NaiveDateTime) -> Vec<ScheduledTask> {
    // THe current time is an object, but it needs to be turned into a number in order to easily schedule tasks on it.
    let mut time = current_time.timestamp() as f64 / 60.0; // current time in minutes

    let mut scheduled_tasks: Vec<ScheduledTask> = Vec::new();

    for task in tasks {
        scheduled_tasks.push(
            ScheduledTask {
                task: task.clone(),
                start_time: NaiveDateTime::from_timestamp_opt((time * 60.0) as i64, 0).expect("Could not convert time to NaiveDateTime")
            }
        );
        time += task.duration as f64
    }

    return scheduled_tasks
}

#[derive(Clone, Debug, PartialEq, Eq)]
struct Obstacle {
    start_time: NaiveDateTime,
    end_time: NaiveDateTime,
}

fn adjust_for_obstacles(scheduled_tasks: &Vec<ScheduledTask>, obstacles: &Vec<Obstacle>) -> Vec<ScheduledTask> {
    let mut accumulated_timing = Duration::minutes(0); // In minutes
    let mut new_scheduled_tasks: Vec<ScheduledTask> = Vec::new();

    for task in scheduled_tasks {
        let mut new_task = task.clone();
        new_task.start_time += accumulated_timing;

        // Find obstacle that overlaps with the task
        // TODO: Make this faster. 
        let end_time = new_task.start_time + Duration::minutes(new_task.task.duration);
        let obstacle = obstacles.iter().find(|obs| 
            obs.end_time >= new_task.start_time && new_task.start_time >= obs.start_time || // Task starts in obstacle
            obs.end_time > end_time && end_time > obs.start_time || // Task ends in obstacle
            new_task.start_time <= obs.start_time && end_time >= obs.end_time // Obstacle is inside task
        );


        if let Some(obs) = obstacle {
            new_task.start_time = obs.end_time;
            accumulated_timing = accumulated_timing + (obs.end_time - task.start_time);
        }

        new_scheduled_tasks.push(new_task)

    }

    return new_scheduled_tasks
}


fn adjust_for_working_hours(scheduled_tasks: &Vec<ScheduledTask>, user_preferences: &UserPreferences) -> Vec<ScheduledTask> {
    let midnight = Utc::now().naive_utc().with_hour(0).expect("Could not set midnight").with_minute(0).expect("Could not set midnight").with_second(0).expect("Could not set midnight");

    let before_work = Obstacle {
        start_time: midnight,
        end_time: user_preferences.start_time
    };

    let after_work = Obstacle {
        start_time: user_preferences.end_time,
        end_time: midnight + Duration::days(1)
    };

    let new_scheduled_tasks = adjust_for_obstacles(scheduled_tasks, &vec![before_work, after_work]);

    return new_scheduled_tasks
}


#[cfg(test)]
mod tests {
    use chrono::Local;

    use super::*;

    use super::Importance::*;

    #[test]
    fn ordering_test() {
        let today = Utc::now().date_naive();

        let input_tasks: Vec<Task> = vec![
            Task { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 3 },
            Task { name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 1 },
            Task { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 4 },
            Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 2 },
        ];

        let expected_output: Vec<TaskWithUrgency> = vec![
            TaskWithUrgency { task: Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 2 }, urgency: Urgency::High },
            TaskWithUrgency { task: Task { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 3 }, urgency: Urgency::Low },
            TaskWithUrgency { task: Task { name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 1 }, urgency: Urgency::High },
            TaskWithUrgency { task: Task { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 4 }, urgency: Urgency::Low },
        ];

        let ordered_tasks = order_tasks(&input_tasks);

        assert_eq!(ordered_tasks, expected_output);

    }

    #[test]
    fn ordering_test_with_duration() {
        let today = Utc::now().date_naive();

        let input_tasks: Vec<Task> = vec![
            Task { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 3 },
            Task { name: "A".to_string(), importance: Low, due_date: today + Duration::days(5), duration: 5 },
            Task { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 2 },
            Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 2 },
        ];

        let expected_output: Vec<TaskWithUrgency> = vec![
            TaskWithUrgency { task: Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 2 }, urgency: Urgency::High },
            TaskWithUrgency { task: Task { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 3 }, urgency: Urgency::High },
            TaskWithUrgency { task: Task { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 2 }, urgency: Urgency::Low },
            TaskWithUrgency { task: Task { name: "A".to_string(), importance: Low, due_date: today + Duration::days(5), duration: 5 }, urgency: Urgency::Low },
        ];

        let ordered_tasks = order_tasks(&input_tasks);

        assert_eq!(ordered_tasks, expected_output);
    }

    #[test]
    fn scheduled_test() {
        let today = Utc::now().date_naive();
        let ordered_tasks = vec![
            Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 120 },
            Task { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 180 },
            Task { name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 60 },
            Task { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 240 },
        ];

        let now = Local::now().naive_utc();

        let expected_output = vec![
            // ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
            // ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 2 },
            // ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 5 },
            // ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 6 },

            ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 120 }, start_time: now },
            ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 180 }, start_time: now + chrono::Duration::minutes(120) },
            ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 60 }, start_time: now + chrono::Duration::minutes(300) },
            ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 240 }, start_time: now + chrono::Duration::minutes(360) },
        ];

        let scheduled_tasks = schedule_tasks(&ordered_tasks, now);

        assert_eq!(scheduled_tasks, expected_output)
    }

    #[test]
    fn schedule_with_obstacles_start_date() {

        let now = Local::now().naive_utc();

        let today = Utc::now().date_naive();

        let ordered_tasks: Vec<ScheduledTask> = vec![
            // ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },  
            // ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 2 },
            // ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 5 },
            // ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 6 },

            ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 120 }, start_time: now },
            ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 180 }, start_time: now + chrono::Duration::minutes(120) },
            ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 60 }, start_time: now + chrono::Duration::minutes(300) },
            ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 240 }, start_time: now + chrono::Duration::minutes(360) }, 

        ];

        let obstacles = vec![
            Obstacle { start_time: now + Duration::minutes(120), end_time: now + Duration::minutes(240) },
        ];

        let expected_output: Vec<ScheduledTask> = vec![
            // ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
            // ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 4 },
            // ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 7 },
            // ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 8 },

            ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 120 }, start_time: now },
            ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 180 }, start_time: now + chrono::Duration::minutes(60 * 4) },
            ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 60 }, start_time: now + chrono::Duration::minutes(60 * 7) },
            ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 240 }, start_time: now + chrono::Duration::minutes(60 * 8) },
        ];

        assert_eq!(adjust_for_obstacles(&ordered_tasks, &obstacles), expected_output) // TODO: This looks right but the timing is just a little bit off so thte test fails
    }

    #[test]
    fn test_working_hours() {
        let today = Utc::now().date_naive();

        let midnight = Utc::now().naive_utc().with_hour(0).expect("Could not set midnight").with_minute(0).expect("Could not set midnight").with_second(0).expect("Could not set midnight");

        let scheduled_tasks = vec![
            ScheduledTask { start_time: midnight, task: Task { name: "A".to_string(), importance: High, due_date: today + Duration::days(1), duration: 60 } },
            ScheduledTask { start_time: midnight + Duration::minutes(60), task: Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 60 } },
        ];



        let user_preferences = UserPreferences {
            start_time: midnight + Duration::hours(9),
            end_time: midnight + Duration::hours(17),
        };

        let expected_output = vec![
            ScheduledTask { start_time: midnight + Duration::hours(9), task: Task { name: "A".to_string(), importance: High, due_date: today + Duration::days(1), duration: 60 } },
            ScheduledTask { start_time: midnight + Duration::hours(10), task: Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 60 } },
        ];

        assert_eq!(adjust_for_working_hours(&scheduled_tasks, &user_preferences), expected_output)
    }

    // #[test]
    // fn schedule_with_obstacles_start_and_end_side() {
    //     let ordered_tasks = vec![
    //         ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },  
    //         ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 2 },
    //         ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 5 },
    //         ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 6 },
    //     ];

    //     let obstacles = vec![
    //         Obstacle { start_time: 3, end_time: 4 },
    //     ];

    //     let expected_output = vec![
    //         ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
    //         ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 4 },
    //         ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 7 },
    //         ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 8 },
    //     ];

    //     assert_eq!(adjust_for_obstacles(&ordered_tasks, &obstacles), expected_output)
    // }

    // #[test]
    // fn schedule_with_obstacles_end_overlap() {
    //     let ordered_tasks = vec![
    //         ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },  
    //         ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 2 }, start_time: 2 },
    //         ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 4 },
    //         ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 5 },
    //     ];

    //     let obstacles = vec![
    //         Obstacle { start_time: 3, end_time: 5 },
    //     ];

    //     let expected_output = vec![
    //         ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
    //         ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 2 }, start_time: 5 },
    //         ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 7 },
    //         ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 8 },
    //     ];

    //     assert_eq!(adjust_for_obstacles(&ordered_tasks, &obstacles), expected_output)
    // }
}
