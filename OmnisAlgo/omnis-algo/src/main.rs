mod autoschedule_algo;

use std::num;

use actix_cors::Cors;
use chrono::{Utc, Timelike, Datelike, DateTime, Duration, NaiveDate, NaiveTime, NaiveDateTime};
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder, middleware::Logger};

use autoschedule_algo::*;
use autoschedule_algo::autoschedule_structs::*;

use itertools::Itertools;
use serde::{Serialize, Deserialize};

use env_logger;


#[derive(Debug, Serialize, Deserialize)]
struct AutoscheduleRequest {
    unscheduled_tasks: Vec<UnscheduledTask>, // Start date can't be before today. 
    user_preferences: UserPreferences,
    obstacles: Option<Vec<Obstacle>>,
}

#[derive(Debug, Serialize, Deserialize)]
struct AutoscheduleResponse {
    scheduled_tasks: Vec<ScheduledTask>,
    error: Option<&'static str>,
    message: Option<&'static str>
}


#[get("/test")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/autoschedule")]
async fn autoschedule(request: web::Json<AutoscheduleRequest>) -> impl Responder {

    if request.unscheduled_tasks.len() == 0 {
        return HttpResponse::Ok().json(AutoscheduleResponse {
            scheduled_tasks: vec![],
            error: None,
            message: Some("No tasks to schedule"),
        })
    }


    let tasks = request.unscheduled_tasks.clone();



    // NOTE: The start time could be after the end time, this is a crappy thing cuz of timezones
    let (start_time, end_time) = (request.user_preferences.start_time.time(), request.user_preferences.end_time.time());

    let period_date = match start_time < end_time {
        true => Utc::now().date_naive(), // the start time and end time are on the save UTC day, so UTC::NOW would have to be the current date
        false => match Utc::now().time() > start_time {// Either Now date is going to be on the start date, or the end date. 
            true => Utc::now().date_naive(), // Same day
            false => Utc::now().date_naive() - Duration::days(1) // Now date is end date, so must subtract a day
        }
    };

    let max_duration = tasks.iter().max_by_key(|task| task.duration).expect("Empty?").duration;
    println!("Max duration: {:?}", max_duration);
    println!("Signed duration: {:?}", end_time.signed_duration_since(start_time).num_minutes().abs());
    if end_time.signed_duration_since(start_time).num_minutes().abs() <= max_duration {
        return HttpResponse::Ok().json(AutoscheduleResponse {
            scheduled_tasks: vec![],
            error: Some("Start time and end time are too close"),
            message: None,
        })
    }


    // Deal with edge of task start date being before today
    let tasks = tasks.into_iter().map(|task| 
        UnscheduledTask {
            start_date: match task.start_date.date_naive() < period_date {
                true => DateTime::<Utc>::from_utc(period_date.and_time(start_time), Utc),
                false => task.start_date
            },
            ..task
        }
    );

    // First break the tasks into groups of tasks that start on the same day
    let groups = tasks.into_iter().group_by(|task| task.start_date.date_naive());

    // Then, for each group, order, schedule the tasks, and bump the tasks that do not get accomplished to the next group. Then do the same with the next group (that has the added tasks)
    let mut scheduled_tasks: Vec<ScheduledTask> = Vec::new();
    // let mut bumped_tasks = Vec::new();

    for (day, tasks) in groups.into_iter() {
        let (start_time, end_time) = match start_time < end_time {
            true => (day.and_time(start_time), day.and_time(end_time)),
            false => (day.and_time(start_time), day.and_time(end_time) + Duration::days(1))
        };

        let (scheduled_tasks_for_day, scheduled_tasks_prev) = scheduled_tasks
            .into_iter()
            .partition(|task| task.scheduled_datetime.naive_utc() >= start_time && task.scheduled_datetime.naive_utc() <= end_time);
        scheduled_tasks = scheduled_tasks_prev;

        let day_tasks = &tasks.collect_vec();

        let all_tasks = scheduled_tasks_for_day.clone().into_iter().map(|task| task.task.task).chain(day_tasks.clone()).collect_vec();


        // check if today is the day
        let now = Utc::now().naive_utc();
        let is_today = match now.time() < start_time.time() {
            true => (now - Duration::days(1)).date() == start_time.date(),
            false => now.date() == start_time.date()
        };

        // Edge: If you schedule all of the day, get bumped back, your will have doubled up tasks
        let scheduled = schedule(&all_tasks, start_time, end_time, request.obstacles.as_ref(), is_today);

        println!("Start time: {:?}, End time: {:?}", start_time, end_time);
        println!("ScheduledTasks: {:?}", scheduled_tasks);
        println!("ScheduledDayTasks: {:?}", scheduled_tasks_for_day);
        println!("DayTasks: {:?}", day_tasks);
        println!("All Tasks: {:?}", all_tasks);

        scheduled_tasks.extend(scheduled);

    }

    return HttpResponse::Ok().json(AutoscheduleResponse {
        scheduled_tasks,
        message: None,
        error: None
    })
}

fn schedule(tasks: &Vec<UnscheduledTask>, start_time: NaiveDateTime, end_time: NaiveDateTime, obstacles: Option<&Vec<Obstacle>>, is_today: bool) -> Vec<ScheduledTask> {
    let ordered_tasks = order_tasks(&tasks);

    let days_start_time = match is_today {
        true => Utc::now().naive_utc(),
        false => start_time
    };

    let scheduled_tasks_for_day = schedule_tasks(&ordered_tasks, DateTime::<Utc>::from_utc(days_start_time, Utc));
    let tasks_with_obstacles = adjust_for_obstacles(&scheduled_tasks_for_day, &obstacles.unwrap_or(&vec![]));

    let (days_tasks, bumped_tasks): (Vec<ScheduledTask>, Vec<ScheduledTask>) = tasks_with_obstacles
        .into_iter()
        .partition(|task| task.scheduled_datetime.naive_utc() + Duration::minutes(task.task.task.duration) < end_time);

    if bumped_tasks.len() == 0 {
        return days_tasks
    }

    let unscheduled_bumped_tasks = bumped_tasks.into_iter().map(|task| task.task.task).collect_vec();

    return days_tasks.into_iter().chain(schedule(&unscheduled_bumped_tasks, start_time + Duration::days(1), end_time + Duration::days(1),  obstacles, false)).collect_vec()
}

#[derive(Debug, Serialize, Deserialize)]
struct TestJson {
    name: String
}
#[post("/testjson")]
async fn testjson(request: web::Json<TestJson>) -> impl Responder {
    HttpResponse::Ok().body(format!("Hello {}", &request.name))
}



#[actix_web::main]
async fn main() -> std::io::Result<()> {

    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    HttpServer::new(|| {
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .service(autoschedule)
            .service(hello)
            .service(testjson)
    })
    .bind(("0.0.0.0", 8080))? // Binds the app to all interfaces in docker container
    .run()
    .await
}
