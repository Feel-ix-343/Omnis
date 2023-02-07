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
	time = int(input("How long do you expect this task to take you (in minutes)? ")) # include article on how to estimate time on UI, 10 is for breaks
	priority = int(input("On a scale of 1-10, how importance is this task for you? ")) # include article on how to estimate difficulty on UI
	deadline = int(input("How many minutes away from January 1st is this task due? "))
	difficulty = input("What is the difficulty [easy/medium/hard]? ")
	ordering = input("Do you like easy or hard tasks first? ")
	pomodoro = input("Would you like to use the pomodoro technique[y/n]? ")
	maxTime = int(input("How long can you work on a task in minutes? "))
	durationTime = int(input("How long do you want to work in a day in minutes? "))
	startHour = int(input("What hour of the day would you like to begin work? "))
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
	repetition = list(map(str, input("What days of the week will this obstacle be repeated (separated by commas ONLY)? ").split(',')))
	startTime = input("Type the start time of this task in military time (13:45)? ")
	duration = int(input("How long in minutes will this osbtacle last (include transportation time)? "))
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
