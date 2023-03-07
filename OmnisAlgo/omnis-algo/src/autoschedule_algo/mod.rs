
use chrono::{Duration, Utc, DateTime};
use itertools::Itertools;



pub mod autoschedule_structs;
use autoschedule_structs::*;    


// TODO: Why would the first half of the tasks be high urgency and the second half low urgency? This seems abitrary.
fn tasks_to_urgency(tasks: &Vec<UnscheduledTask>) -> Vec<UnscheduledTaskWithUrgency> {
    // Group tasks by their due date and assign urgency based mediad calculations in the list. Edges: all tasks are due on the same day -> all are high urgency
    let tasks_by_date_groups = tasks.iter()
        .group_by(|task| task.due_date);

    let tasks_by_date_sorted = tasks_by_date_groups
        .into_iter()
        .sorted_by_key(|(date, _)| *date);

    let tasks_with_urgency: Vec<UnscheduledTaskWithUrgency> = match tasks_by_date_sorted.exactly_one() {
        Ok((_, tasks)) => tasks.map(|task| UnscheduledTaskWithUrgency{task: task.clone(), urgency: Urgency::High}).collect_vec(),
        Err(tasks_by_date_sorted) => {
            let midpoint = match tasks_by_date_sorted.len() % 2 {
                0 => tasks_by_date_sorted.len() / 2,
                _ => tasks_by_date_sorted.len() / 2 + 1
            };
            let tasks_vec: Vec<(DateTime<Utc>, Vec<&UnscheduledTask>)> = tasks_by_date_sorted.map(|(date, tasks)| (date, tasks.collect_vec())).collect_vec();
            let high_urgency = tasks_vec[0..midpoint]
                .into_iter()
                .flat_map(|(_, tasks)| tasks.into_iter().map(|&task| UnscheduledTaskWithUrgency{task: task.clone(), urgency: Urgency::High}))
                .collect_vec();

            let low_urgency = tasks_vec[midpoint..]
                .into_iter()
                .flat_map(|(_, group)| group.into_iter().map(|&task| UnscheduledTaskWithUrgency{task: task.clone(), urgency: Urgency::Low}))
                .collect_vec();

            return vec![high_urgency, low_urgency].into_iter().flatten().collect_vec();
        }
    };

    return tasks_with_urgency
}

pub fn order_tasks(tasks: &Vec<UnscheduledTask>) -> Vec<UnscheduledTaskWithUrgency> {
    let mut tasks_with_urgency: Vec<UnscheduledTaskWithUrgency> = tasks_to_urgency(tasks);

    // Sort tasks by importance, urgency and duration (based on user preference)
    tasks_with_urgency.sort_by_key(|task| (task.task.importance, task.urgency, task.task.duration)); // Sorts low to high

    return tasks_with_urgency
}


// I need to schedule tasks in a way that will be understandable in to the UI as date time form


/// This takes a list of tasks and the current time, and lays the tasks in a timeline from the current time
/// current_time takes date, hours, and minutes into account. TODO: Think about local time vs server time
/// Should convert from the data base time to NaiveDateTime
pub fn schedule_tasks(tasks: &Vec<UnscheduledTaskWithUrgency>, first_time: DateTime<Utc>) -> Vec<ScheduledTask> {
    // THe current time is an object, but it needs to be turned into a number in order to easily schedule tasks on it.
    let mut time = first_time;  // Fierst time is copied

    let mut scheduled_tasks: Vec<ScheduledTask> = Vec::new();

    for task in tasks {
        scheduled_tasks.push(
            ScheduledTask {
                task: task.clone(),
                scheduled_datetime: time
            }
        );
        time += Duration::minutes(task.task.duration)
    }

    return scheduled_tasks
}

pub fn adjust_for_obstacles(scheduled_tasks: &Vec<ScheduledTask>, obstacles: &Vec<Obstacle>) -> Vec<ScheduledTask> {
    let mut accumulated_timing = Duration::minutes(0); // In minutes
    let mut new_scheduled_tasks: Vec<ScheduledTask> = Vec::new();

    for task in scheduled_tasks {
        let mut new_task = task.clone();
        new_task.scheduled_datetime += accumulated_timing;

        // Find obstacle that overlaps with the task
        // TODO: Make this faster. 
        let end_time = new_task.scheduled_datetime + Duration::minutes(new_task.task.task.duration); // TODO: Fix this dumb syntax
        let obstacle = obstacles.iter().find(|obs| 
            obs.end_time >= new_task.scheduled_datetime && new_task.scheduled_datetime >= obs.start_time || // Task starts in obstacle
            obs.end_time > end_time && end_time > obs.start_time || // Task ends in obstacle
            new_task.scheduled_datetime <= obs.start_time && end_time >= obs.end_time // Obstacle is inside task
        );


        if let Some(obs) = obstacle {
            new_task.scheduled_datetime = obs.end_time;
            accumulated_timing = accumulated_timing + (obs.end_time - task.scheduled_datetime);
        }

        new_scheduled_tasks.push(new_task)

    }

    return new_scheduled_tasks
}


// pub fn adjust_for_working_hours(scheduled_tasks: &Vec<ScheduledTask>, start_time: DateTime<Utc>, end_time: DateTime<Utc>) -> Vec<ScheduledTask> {
//     let midnight = Utc::now().with_hour(0).expect("Could not set midnight").with_minute(0).expect("Could not set midnight").with_second(0).expect("Could not set midnight");
// 
//     let before_work = Obstacle {
//         start_time: midnight,
//         end_time: start_time // Deref bc naivedate is copyable
//     };
// 
//     let after_work = Obstacle {
//         start_time: end_time,
//         end_time: midnight + Duration::days(1)
//     };
// 
//     let new_scheduled_tasks = adjust_for_obstacles(scheduled_tasks, &vec![before_work, after_work]);
// 
//     return new_scheduled_tasks
// }


// #[cfg(test)]
// mod tests {
//     use chrono::Local;
// 
//     use super::*;
// 
//     use super::Importance::*;
// 
//     #[test]
//     fn ordering_test() {
//         let today = Utc::now().naive_utc();
// 
//         let input_tasks: Vec<UnscheduledTask> = vec![
//             UnscheduledTask { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 3 },
//             UnscheduledTask { name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 1 },
//             UnscheduledTask { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 4 },
//             UnscheduledTask { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 2 },
//         ];
// 
//         let expected_output: Vec<UnscheduledTaskWithUrgency> = vec![
//             UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 2 }, urgency: Urgency::High },
//             UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 3 }, urgency: Urgency::Low },
//             UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 1 }, urgency: Urgency::High },
//             UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 4 }, urgency: Urgency::Low },
//         ];
// 
//         let ordered_tasks = order_tasks(&input_tasks);
// 
//         assert_eq!(ordered_tasks, expected_output);
// 
//     }
// 
//     #[test]
//     fn ordering_test_with_duration() {
//         let today = Utc::now().naive_utc();
// 
//         let input_tasks: Vec<UnscheduledTask> = vec![
//             UnscheduledTask { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 3 },
//             UnscheduledTask { name: "A".to_string(), importance: Low, due_date: today + Duration::days(5), duration: 5 },
//             UnscheduledTask { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 2 },
//             UnscheduledTask { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 2 },
//         ];
// 
//         let expected_output: Vec<UnscheduledTaskWithUrgency> = vec![
//             UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 2 }, urgency: Urgency::High },
//             UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 3 }, urgency: Urgency::High },
//             UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 2 }, urgency: Urgency::Low },
//             UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "A".to_string(), importance: Low, due_date: today + Duration::days(5), duration: 5 }, urgency: Urgency::Low },
//         ];
// 
//         let ordered_tasks = order_tasks(&input_tasks);
// 
//         assert_eq!(ordered_tasks, expected_output);
//     }
// 
//     #[test]
//     fn scheduled_test() {
//         let today = Utc::now().naive_utc();
//         let ordered_tasks = vec![
//             UnscheduledTaskWithUrgency{ task: UnscheduledTask { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 120 }, urgency: Urgency::High },
//             UnscheduledTaskWithUrgency{ task: UnscheduledTask { name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 180 }, urgency: Urgency::Low },
//             UnscheduledTaskWithUrgency{ task: UnscheduledTask { name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 60 }, urgency: Urgency::High },
//             UnscheduledTaskWithUrgency{ task: UnscheduledTask { name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 240 }, urgency: Urgency::Low },
//         ];
// 
//         let now = Local::now().naive_utc();
// 
//         let expected_output = vec![
//             // ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
//             // ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 2 },
//             // ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 5 },
//             // ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 6 },
// 
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 120}, urgency: Urgency::High }, scheduled_datetime: now },
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 180}, urgency: Urgency::Low }, scheduled_datetime: now + chrono::Duration::minutes(120) },
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 60 }, urgency: Urgency::High}, scheduled_datetime: now + chrono::Duration::minutes(300) },
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 240 }, urgency: Urgency::Low}, scheduled_datetime: now + chrono::Duration::minutes(360) },
//         ];
// 
//         let scheduled_tasks = schedule_tasks(&ordered_tasks, now);
// 
//         assert_eq!(scheduled_tasks, expected_output)
//     }
// 
//     #[test]
//     fn schedule_with_obstacles_start_date() {
// 
//         let now = Local::now().naive_utc();
// 
//         let today = Utc::now().naive_utc();
// 
//         let ordered_tasks: Vec<ScheduledTask> = vec![
//             // ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },  
//             // ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 2 },
//             // ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 5 },
//             // ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 6 },
// 
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 120}, urgency: Urgency::High }, scheduled_datetime: now },
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 180}, urgency: Urgency::Low }, scheduled_datetime: now + chrono::Duration::minutes(120) },
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 60 }, urgency: Urgency::High}, scheduled_datetime: now + chrono::Duration::minutes(300) },
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 240 }, urgency: Urgency::Low}, scheduled_datetime: now + chrono::Duration::minutes(360) },
// 
//         ];
// 
//         let obstacles = vec![
//             Obstacle { start_time: now + Duration::minutes(120), end_time: now + Duration::minutes(240) },
//         ];
// 
//         let expected_output: Vec<ScheduledTask> = vec![
//             // ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
//             // ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 4 },
//             // ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 7 },
//             // ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 8 },
// 
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 120}, urgency: Urgency::High }, scheduled_datetime: now },
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "C".to_string(), importance: High, due_date: today + Duration::days(3), duration: 180}, urgency: Urgency::Low }, scheduled_datetime: now + chrono::Duration::minutes(60 * 4) },
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "A".to_string(), importance: Low, due_date: today + Duration::days(1), duration: 60 }, urgency: Urgency::High}, scheduled_datetime: now + chrono::Duration::minutes(60 * 7) },
//             ScheduledTask { task: UnscheduledTaskWithUrgency { task: UnscheduledTask{ name: "D".to_string(), importance: Low, due_date: today + Duration::days(4), duration: 240 }, urgency: Urgency::Low}, scheduled_datetime: now + chrono::Duration::minutes(60 * 8) },
//         ];
// 
//         assert_eq!(adjust_for_obstacles(&ordered_tasks, &obstacles), expected_output) // TODO: This looks right but the timing is just a little bit off so thte test fails
//     }
// 
//     #[test]
//     fn test_working_hours() {
//         let today = Utc::now().naive_utc();
// 
//         let midnight = Utc::now().naive_utc().with_hour(0).expect("Could not set midnight").with_minute(0).expect("Could not set midnight").with_second(0).expect("Could not set midnight");
// 
//         let scheduled_tasks = vec![
//             // ScheduledTask { start_time: midnight + Duration::minutes(60), task: Task { name: "A".to_string(), importance: High, due_date: today + Duration::days(1), duration: 60 } },
//             // ScheduledTask { start_time: midnight + Duration::minutes(60), task: Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 60 } },
//             ScheduledTask { scheduled_datetime: midnight + Duration::minutes(60), task: UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "A".to_string(), importance: High, due_date: today + Duration::days(1), duration: 60 }, urgency: Urgency::High } },
//             ScheduledTask { scheduled_datetime: midnight + Duration::minutes(120), task: UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 60 }, urgency: Urgency::High } },
//         ];
// 
// 
// 
//         let user_preferences = UserPreferences {
//             start_time: midnight + Duration::hours(9),
//             end_time: midnight + Duration::hours(17),
//         };
// 
//         let expected_output = vec![
//             // ScheduledTask { start_time: midnight + Duration::hours(9), task: Task { name: "A".to_string(), importance: High, due_date: today + Duration::days(1), duration: 60 } },
//             // ScheduledTask { start_time: midnight + Duration::hours(10), task: Task { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 60 } },
//             ScheduledTask { scheduled_datetime: midnight + Duration::hours(9), task: UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "A".to_string(), importance: High, due_date: today + Duration::days(1), duration: 60 }, urgency: Urgency::High } },
//             ScheduledTask { scheduled_datetime: midnight + Duration::hours(10), task: UnscheduledTaskWithUrgency { task: UnscheduledTask { name: "B".to_string(), importance: High, due_date: today + Duration::days(2), duration: 60 }, urgency: Urgency::High } },
//         ];
// 
//         assert_eq!(adjust_for_working_hours(&scheduled_tasks, &user_preferences.start_time, &user_preferences.end_time), expected_output)
//     }
// 
//     // #[test]
//     // fn schedule_with_obstacles_start_and_end_side() {
//     //     let ordered_tasks = vec![
//     //         ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },  
//     //         ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 2 },
//     //         ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 5 },
//     //         ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 6 },
//     //     ];
// 
//     //     let obstacles = vec![
//     //         Obstacle { start_time: 3, end_time: 4 },
//     //     ];
// 
//     //     let expected_output = vec![
//     //         ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
//     //         ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 3 }, start_time: 4 },
//     //         ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 7 },
//     //         ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 8 },
//     //     ];
// 
//     //     assert_eq!(adjust_for_obstacles(&ordered_tasks, &obstacles), expected_output)
//     // }
// 
//     // #[test]
//     // fn schedule_with_obstacles_end_overlap() {
//     //     let ordered_tasks = vec![
//     //         ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },  
//     //         ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 2 }, start_time: 2 },
//     //         ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 4 },
//     //         ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 5 },
//     //     ];
// 
//     //     let obstacles = vec![
//     //         Obstacle { start_time: 3, end_time: 5 },
//     //     ];
// 
//     //     let expected_output = vec![
//     //         ScheduledTask { task: Task { name: "B".to_string(), importance: High, due_date: 2, duration: 2 }, start_time: 0 },
//     //         ScheduledTask { task: Task { name: "C".to_string(), importance: High, due_date: 3, duration: 2 }, start_time: 5 },
//     //         ScheduledTask { task: Task { name: "A".to_string(), importance: Low, due_date: 1, duration: 1 }, start_time: 7 },
//     //         ScheduledTask { task: Task { name: "D".to_string(), importance: Low, due_date: 4, duration: 4 }, start_time: 8 },
//     //     ];
// 
//     //     assert_eq!(adjust_for_obstacles(&ordered_tasks, &obstacles), expected_output)
//     // }
// }
