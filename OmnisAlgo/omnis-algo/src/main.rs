mod autoschedule_algo;

use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use autoschedule_algo::*;
use serde::{Serialize, Deserialize};


#[derive(Debug, Serialize, Deserialize)]
struct AutoscheduleRequest {
    unscheduled_tasks: Vec<Task>,
    user_preferences: UserPreferences,
    obstacles: Vec<Obstacle>,
}


#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[get("/autoschedule")]
async fn autoschedule(request: web::Json<AutoscheduleRequest>) -> impl Responder {
    HttpResponse::Ok().body("Hello autoschedule!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(autoschedule)
            .service(hello)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
