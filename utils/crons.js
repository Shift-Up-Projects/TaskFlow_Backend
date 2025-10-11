const cron = require("node-cron");
const { createAndSendMessageNotification } = require("../utils/firebaseNotification");
const { Task } = require("../models/Task");

cron.schedule("*/5 * * * *", async () => { // كل 5 دقائق
  const startTime = Date.now();
  const currentDate = new Date();

  try {
    console.log(`[CRON] Task update started at ${new Date().toISOString()}`);

    const startedTasks = await Task.find({ startDate: { $lte: currentDate }, status: 'pending' });

    await Task.updateMany(
      { startDate: { $lte: currentDate }, status: 'pending' },
      { $set: { status: 'in-progress' } },
      { new: true }
    );

    for(const task of startedTasks) {
        const createdForUser = task.user_id;
        const refType = 'Task';
        const refId = task._id;
        const title = 'Task Alert';
        const body = `task ${task.title} start time at this moment, let's go to do it ^_^.`;
        createAndSendMessageNotification(createdForUser, refType, refId, title, body);
    }

    const notCompletedTasks = await Task.find({ dueDate: { $lt: currentDate }, status: 'in-progress' })
    await Task.updateMany(
      { dueDate: { $lt: currentDate }, status: 'in-progress' },
      { $set: { status: 'not-completed' } },
      { new: true }
    );

    for(const task of notCompletedTasks) {
        const createdForUser = task.user_id;
        const refType = 'Task';
        const refId = task._id;
        const title = 'Task Alert';
        const body = `task ${task.title} end time and you did't complete it at the Exact time v_v.`;
        createAndSendMessageNotification(createdForUser, refType, refId, title, body);
    }

    const endTime = Date.now();
    console.log(`[CRON] Task update finished in ${endTime - startTime}ms`);
  } catch (error) {
    console.error("[CRON] Error in tasks update", error);
  }
});

cron.schedule("0 0 * * *", async () => { // كل يوم الساعة 00:00
  const startTime = Date.now();

  try {
    console.log(`[CRON] Tasks search to send alert if task end time in next day, this schedule started at ${new Date().toISOString()}`);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setHours(23, 59, 59, 999);

    // جلب المهام التي موعدها غداً
    const tasks = await Task.find({
      dueDate: { $gte: tomorrow, $lte: nextDay }
    });

    for (const task of tasks) {
        const createdForUser = task.user_id;
        const refType = 'Task';
        const refId = task._id;
        const title = 'Task Alert';
        const body = `1 day left for the task: ${task.title}`;
        createAndSendMessageNotification(createdForUser, refType, refId, title, body);
    }

    const endTime = Date.now();
    console.log(`[CRON] Tasks alerts is sent in ${endTime - startTime}ms`);
  } catch (error) {
    console.error("[CRON] Error in send tasks alerts", error);
  }
});
