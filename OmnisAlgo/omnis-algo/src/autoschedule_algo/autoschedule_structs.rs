use chrono::NaiveDateTime;
use serde::{Serialize, Deserialize};

use super::omnis_date_format;



#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct UserPreferences {
    /// Hour of the day that the user wants to start working. This should be in naive time
    #[serde(with = "omnis_date_format")]
    pub start_time: NaiveDateTime,
    /// Hour of the day that the user wants to end working. This should be in naive time
    #[serde(with = "omnis_date_format")]
    pub end_time: NaiveDateTime,
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
    pub editable: bool,
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
    #[serde(with = "omnis_date_format")]
    pub due_date: NaiveDateTime, 

    pub completed: bool,

    pub steps: Option<Vec<Step>>
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
    #[serde(with = "omnis_date_format")]
    pub scheduled_datetime: NaiveDateTime,
}


#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Obstacle {
    #[serde(with = "omnis_date_format")]
    pub start_time: NaiveDateTime,
    #[serde(with = "omnis_date_format")]
    pub end_time: NaiveDateTime,
}
