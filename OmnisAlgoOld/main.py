from flask import Flask, request
import os


app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def main():
    data = request.json

    if (data is None):
        return "JSon"

    tasks = data["unscheduledTasks"],

    return "Schedule"



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)

def condition(element):
	return element[1], element[2], element[3];

def isAvaliableTime(hours1, minutes1, hours2, minutes2, duration1, duration2):
	start1 = hours1 * 60 + minutes1
	end1 = start1 + duration1
	start2 = hours2 * 60 + minutes2
	end2 = start2 + duration2
	if end1 > start2 and end1 < end2:
		return False
	if start1 > start2 and start1 < end2 and end1 > end2:
		return False
	if start1 < start2 and end1 > end2 and start2 < end1:
		return False
	if start1 > start2 and end1 < end2:
		return False
	return True


def generateSchedule(preferences: dict, tasksDict: list[dict], obstaclesDict: dict):
    ordering = preferences["ordering"] # easy or hard
    pomodoro: bool = preferences["pomodoro"] # boolean
    maxTime = preferences[ "maxTime" ]
    durationTime = preferences["durationTime"]
    startHour = preferences["startTime"]
    startMinutes = preferences["startTime"] - round(preferences["startTime"])

    tasks = []
    moreTasks = True
    for task in tasksDict:
        time = task["duration"]
        priority = task["importance"]

        deadline = int(input("How many minutes away from January 1st is this task due? ")) # TODO: how does this work and how can I fix it

        difficulty = task["difficulty"]

        if ordering == "easy":
            if difficulty == "easy":
                preference = 1
            if difficulty == "medium":
                preference = 2
            if difficulty == "hard":
                preference = 3
        if ordering == "hard":
            if difficulty == "easy":
                preference = 3
            if difficulty == "medium":
                preference = 2
            if difficulty == "hard":
                preference = 1

        if time < maxTime:
            tasks.append([time,deadline,priority, preference])
        else:
            while time > maxTime:
                tasks.append([maxTime, deadline, priority, preference])
                time -= maxTime
            tasks.append([time, deadline, priority, preference])
        moreTasksInput = input("Do you have any more tasks [y/n]? ")
        if moreTasksInput == "y":
            moreTasks = True
        else:
            moreTasks = False

        tasks.sort(key=condition)

        obstacles = []
        moreObstacles = True
        while moreObstacles:
            repetition = list(map(str, input("What days of the week will this obstacle be repeated (separated by commas ONLY)? ").split(',')))
            startTime = input("Type the start time of this task in military time (13:45)? ")
            duration = int(input("How long in minutes will this osbtacle last (include transportation time)? "))
            obstacles.append([repetition, int(startTime.split(":")[0]), int(startTime.split(":")[1]), duration])
            moreObstaclesInput = input("Do you have any more obstacles [y/n]? ")
            if moreObstaclesInput == "y":
                moreObstacles = True
            else:
                moreObstacles = False

        schedule = [[] * 365]
        daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        hour = 0
        minutes = 0
        for day in range(365):
            dayTime = 0
            dayOfTheWeek = daysOfTheWeek[day % 7]
            for task in tasks:
                hour = startHour
                minutes = startMinutes
                avaliableTime = False
                while hour < 24 and not avaliableTime:
                    if pomodoro == "y":
                        task[0] += 40
                    avaliableTime = True
                    for obstacle in obstacles:
                        if dayOfTheWeek in obstacle[0]:
                            avaliableTime = isAvaliableTime(hour, minutes, obstacle[1], obstacle[2], task[0], obstacle[3])
                    for item in schedule:
                        avalaibleTime = isAvaliableTime(hour, minutes, item[0], item[1], task[0], item[2])
                    minutes += task[0]
                    if minutes > 60:
                        hour += 1
                if hour >= 24 or dayTime + task[0] > durationTime:
                    continue
                else:
                    schedule[0].append([hour, minutes, task[0]])
                    dayTime += task[0]

        for task in schedule:
            for item in task:
                print(item, end = " ")
            print("\n")
