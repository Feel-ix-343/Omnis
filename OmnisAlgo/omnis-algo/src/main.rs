mod autoschedule_algo;

use actix_cors::Cors;
use chrono::Utc;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder, middleware::Logger};

use autoschedule_algo::*;
use autoschedule_algo::autoschedule_structs::*;

use serde::{Serialize, Deserialize};

use env_logger;


#[derive(Debug, Serialize, Deserialize)]
struct AutoscheduleRequest {
    unscheduled_tasks: Vec<UnscheduledTask>,
    user_preferences: Option<UserPreferences>,
    obstacles: Option<Vec<Obstacle>>,
}


#[get("/test")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/autoschedule")]
async fn autoschedule(request: web::Json<AutoscheduleRequest>) -> impl Responder {
    let tasks = request.unscheduled_tasks.clone();


    let ordered_tasks = order_tasks(&tasks);
    let scheduled_tasks = schedule_tasks(&ordered_tasks, Utc::now());// TODO: Will need to fix this for the user

    // let tasks_in_working_hours = adjust_for_working_hours(&scheduled_tasks, request.user_preferences.start_time, request.user_preferences.end_time); // TODO: Fix TZs

    if let Some(obstacles) = &request.obstacles {
        let tasks_with_obstacles = adjust_for_obstacles(&scheduled_tasks, obstacles);
        return HttpResponse::Ok().json(tasks_with_obstacles);
    }

    return HttpResponse::Ok().json(scheduled_tasks)
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
