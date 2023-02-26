import json

f = open('UnscheduledTask.schema.json')
data = json.load(f)
preferences = json.load(open("UserPreferences.schema.json"))
obstacles = json.load(open("Obstacle.schema.json"))

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

tasks = [[]]
moreTasks = True
while moreTasks:
	time = data["duration"]
	priority = data["importance"] # include article on how to estimate difficulty on UI
	deadline = data["dueDate"]
	difficulty = data["difficulty"]
	ordering = preferences["ordering"]
	pomodoro = preferences["pomodoro"]
	maxTime = preferences["maxTime"]
	durationTime = preferences["durationTime"]
	startHour = preferences["startTime"]
	startMinutes = int(input("What minutes of that hour would you like to begin work? "))
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
		tasks.append(time,deadline,priority, preference)
	else:
		while time > maxTime:
			tasks.append(maxTime, deadline, priority, preference)
			time -= maxTime
		tasks.append(time, deadline, priority, preference)
	moreTasksInput = input("Do you have any more tasks [y/n]? ")
	moreTasks = True if moreTasksInput = 'y' else 'no'

tasks = sorted(tasks, key = lambda x : (x[1], x[2], x[3]))

obstacles = [[]]
moreObstacles = True
while moreObstacles:
	repetition = obstacles["repetition"]
	startTime = obstacles["startTime"]
	duration = obstacles["duration"]
	obstacles.append(repetition, int(startTime.split(":")[0]), int(startTime.split(":")[1]), duration)
	moreObstaclesInput = input("Do you have any more obstacles [y/n]? ")
	moreObstacles = True if moreObstaclesInput = 'y' else False

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
		while hour < 24 and !avaliableTime:
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
			schedule[0].append(hour, minutes, task[0])
			dayTime += task[0]

scheduledTask = json.dumps(schedule, indent = 4)