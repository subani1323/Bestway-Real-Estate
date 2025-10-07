const cron = require("node-cron");
const Reminder = require("../models/Reminder");

const startReminderScheduler = async () => {
  // Schedule to run every minute to check for reminders
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Find all reminders that are due
      const dueReminders = await Reminder.find({
        reminderDate: { $lte: now },
        status: "pending",
      });

      // Process each due reminder
      for (const reminder of dueReminders) {
        // Here you can add notification logic (email, SMS, etc.)
        console.log(`Processing reminder: ${reminder.title}`);

        // Update reminder status to completed
        reminder.status = "completed";
        await reminder.save();
      }
    } catch (error) {
      console.error("Error in reminder scheduler:", error);
    }
  });
};

module.exports = {
  startReminderScheduler,
};
