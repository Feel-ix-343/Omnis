import { procedure, router } from "../utils";
import { z } from "zod";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { CompletedTask, ScheduledTask, WorkingTask } from "~/utils/taskStates";
import { Goal } from "~/components/SettingsView";

const OpenAIChatMessage: z.ZodType<ChatCompletionRequestMessage> = z.any();

const configuration = new Configuration({
  organization: "org-qEhpZInvhW1XpV73wvJMhHRb",
  apiKey: process.env.SERVER_OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

const ZScheduledTask: z.ZodType<ScheduledTask> = z.any();
const ZWorkingTask: z.ZodType<WorkingTask> = z.any();
const ZCompletedTask: z.ZodType<CompletedTask> = z.any();
const ZGoal: z.ZodType<Goal> = z.any();


export default router({
  reflection: procedure.input(z.object({
    messages: z.array(OpenAIChatMessage).nullable(),
    scheduledTasks: z.array(ZScheduledTask).nullable(),
    workingTask: ZWorkingTask.nullable(),
    completedTasks: z.array(ZCompletedTask).nullable(),
    goals: z.array(ZGoal).nullable(),
  })).query(async (opts) => {

    console.log(opts.ctx.user.user.user_metadata.full_name)

    const {messages, scheduledTasks: scheduled, workingTask, completedTasks: completed, goals} = opts.input

    const initialMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: `You are a cognitive behavioral therapist. You first ask a question, then wait for the user to respond. You are guiding a client through a daily reflection. The user will give tasks and goals. Refer to the tasks and goals by their names, NOT their ids. Here are the scheduled, working, and completed tasks in the user's day. Scheduled: ${JSON.stringify(scheduled)}; Completed Tasks: ${JSON.stringify(completed)}; Working Task (the one I am doing right now): ${JSON.stringify(workingTask)}. Here are the user's goals, each goal is linked to a task by its id: ${JSON.stringify(goals)}. First reflect on the most important completed tasks of the day (if any), then talk about three scheduled tasks (if any), then help the user to find a general concensus on their day. Do each of these reflection points step by step`
    }

    const allMessages = [initialMessage, ...messages ?? []]

    const completionResponse = await openai.createChatCompletion({
      messages: allMessages,
      model: "gpt-3.5-turbo",
      temperature: 1
    })

    const completion = completionResponse.data.choices[0].message;
    //const userMessages = [...messages, completion]


    return completion
  })
})
