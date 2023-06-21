
use actix_cors::Cors;
use actix_web::{HttpServer, Responder, get, web, App, HttpResponse, middleware::Logger, post};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use openai_api_rs::v1::{api::Client, chat_completion::{ChatCompletionRequest, self, ChatCompletionMessage, MessageRole}};
use wasm_typescript_definition::TypescriptDefinition;
use std::env;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, TS, Debug)]
#[ts(export)]
enum Role {
    user,
    system,
    assistant
}

impl From<MessageRole> for Role {
    fn from(role: MessageRole) -> Self {
        match role {
            MessageRole::user => Role::user,
            MessageRole::system => Role::system,
            MessageRole::assistant => Role::assistant
        }
    }
}

impl From<Role> for MessageRole {
    fn from(r: Role) -> Self {
        match r {
            Role::user => MessageRole::user,
            Role::system => MessageRole::system,
            Role::assistant => MessageRole::assistant
        }
    }
}

#[derive(Serialize, Deserialize, TS, Debug)]
#[ts(export)]
struct ChatMessage {
    role: Role,
    content: String
}

impl From<ChatCompletionMessage> for ChatMessage {
    fn from(message: ChatCompletionMessage) -> Self {
        ChatMessage {
            role: message.role.into(),
            content: message.content.unwrap()
        }
    }
}

impl From<ChatMessage> for ChatCompletionMessage {
    fn from(m: ChatMessage) -> Self {
        ChatCompletionMessage {
            role: m.role.into(),
            content: Some(m.content),
            name: None,
            function_call: None
        }
    }
}

#[derive(Serialize, Deserialize, TS, Debug)]
#[ts(export)]
struct ReflectionRequest {
    messages: Vec<ChatMessage>
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct ReflectionResponse {
    message: Option<ChatMessage>,
    error: Option<String>
}

#[post("/reflection")]
async fn reflection(request: web::Json<ReflectionRequest>) -> impl Responder {
    let request: ReflectionRequest = request.into_inner();
    println!("Request: {:#?}", request);

    let client = Client::new(env::var("OPENAI_API_KEY").unwrap().to_string());
    let req = ChatCompletionRequest {
        model: chat_completion::GPT3_5_TURBO.to_string(),
        messages: request.messages.into_iter().map(|m| ChatCompletionMessage::from(m)).collect(),
        function_call: None,
        functions: None
    };

    let result = client.chat_completion(req).await;

    HttpResponse::Ok().json(match result {
        Ok(mut res) => ReflectionResponse {
            message: Some(res.choices.remove(0).message.into()),
            error: None
        },
        Err(e) => ReflectionResponse {
            message: None,
            error: Some(format!{"Openai API Error: {}", e})
        }
    })
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {

    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    HttpServer::new(|| {
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .service(reflection)
    })
        .bind(("0.0.0.0", 8081))? // Binds the app to all interfaces in docker container
        .run()
    .await
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use schemars::schema_for_value;
//     use serde::{Deserialize, Serialize};
//     use serde_reflection::{Registry, Tracer, TracerConfig};
//     use std::io::Write;
// 
// 
//     #[test]
//     fn test_types() {
// 
//         #[derive(Serialize, Deserialize)]
//         struct Test {
//             a: Vec<u64>,
//             b: (u32, u32),
//         }
// 
//         // Obtain the Serde format of `Test`. (In practice, formats are more likely read from a file.)
//         let mut tracer = Tracer::new(TracerConfig::default());
//         tracer.trace_simple_type::<Test>().unwrap();
//         let registry = tracer.registry().unwrap();
// 
//         let mut source = Vec::new();
//         let config = serde_generate::CodeGeneratorConfig::new("testing".to_string())
//             .with_encodings(vec![serde_generate::Encoding::Bincode]);
//         let generator = serde_generate::typescript::CodeGenerator::new(&config);
//         generator.output(&mut source, &registry).unwrap();
//         // Write source to a file
//         std::fs::write("testing.ts", source.clone()).unwrap();
//     }
// 
//     #[test]
//     fn test_schemars() {
//         use schemars::{JsonSchema, schema_for};
// 
// 
//         #[derive(JsonSchema)]
//         struct Test {
//             a: Vec<u64>,
//             b: (u32, u32)
//         }
// 
//         let schema = schema_for!(Test);
//         let out = serde_json::to_string_pretty(&schema).unwrap();
// 
//         std::fs::write("testing.schema.json", out).unwrap();
//     }
// 
//     #[test]
//     fn gen_schemas() {
// 
//         let request_schema = schema_for_value!(ReflectionRequest {
//             messages: vec![
//                 ChatCompletionMessage {
//                     role: MessageRole::user,
//                     name: None,
//                     content: Some(String::from("Hello")),
//                     function_call: None
//                 }
//             ]
//         });
// 
//         let out = serde_json::to_string_pretty(&request_schema).unwrap();
//         std::fs::write("request.schema.json", out).unwrap();
//     }
// 
//     #[test]
//     fn gen_request_type() {
// 
//         // Obtain the Serde format of `Test`. (In practice, formats are more likely read from a file.)
//         let mut tracer = Tracer::new(TracerConfig::default());
//         tracer.trace_simple_type::<RgflectionRequest>().unwrap();
//         let registry = tracer.registry().unwrap();
// 
//         let mut source = Vec::new();
//         let config = serde_generate::CodeGeneratorConfig::new("testing".to_string())
//             .with_encodings(vec![serde_generate::Encoding::Bincode]);
//         let generator = serde_generate::typescript::CodeGenerator::new(&config);
//         generator.output(&mut source, &registry).unwrap();
//         // Write source to a file
//         std::fs::write("request.ts", source.clone()).unwrap();
// 
//     }
// }
