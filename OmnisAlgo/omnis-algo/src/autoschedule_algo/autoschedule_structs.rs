use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};

// use super::omnis_date_format;



#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct UserPreferences {
    /// Hour of the day that the user wants to start working. This should be in naive time
    // #[serde(with = "omnis_date_format")]
    pub start_time: DateTime<Utc>,
    /// Hour of the day that the user wants to end working. This should be in naive time
    // #[serde(with = "omnis_date_format")]
    pub end_time: DateTime<Utc>,
}

#[derive(PartialEq, Eq, PartialOrd, Ord, Debug, Clone, Copy, Serialize, Deserialize)]
pub enum Importance {
    Low=2,
    High=1
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Step {
    pub id: String,
    /// Duration of the step in minutes
    pub duration: i64,
    pub description: String,
    pub completed: bool,
    pub edited: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct UnscheduledTask {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    /// Duration of the task in minutes
    pub duration: i64,

    /// THe importance of the task: either high or low
    pub importance: Importance,

    /// Due date in days away from current date. Tihs has time, but it is really just date
    pub due_date: DateTime<Utc>, 

    pub steps: Option<Vec<Step>>,

    pub start_date: DateTime<Utc>
}


    
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Copy, Serialize, Deserialize)]
pub enum Urgency {
    Low=2,
    High=1
}
    
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct UnscheduledTaskWithUrgency {
    pub task: UnscheduledTask,
    pub urgency: Urgency,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ScheduledTask {
    pub task: UnscheduledTaskWithUrgency,
    pub scheduled_datetime: DateTime<Utc>,
}


#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Obstacle {
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
}
