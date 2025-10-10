// services/cron.service.js
import cron from "node-cron";
import PKS from "../models/pks.model.js";
import { sendReminderEmail } from "./email.service.js";

// Menjadwalkan cron job untuk berjalan setiap hari jam 8 pagi
export const startReminderCronJob = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("Running a daily check for PKS reminders at 8:00 AM...");

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set ke awal hari agar perbandingan tanggal akurat

    try {
      const pksListToRemind = await PKS.find({
        "properties.isReminderActive": true,
        "properties.notificationsSent": { $lt: 4 },
        "properties.reminderDate": { $lte: today },
      });

      for (const pks of pksListToRemind) {
        // Kirim email
        await sendReminderEmail(pks.properties.email, {
          nomor: pks.content.nomor,
          judul: pks.content.judul,
        });

        const updates = {
          "properties.notificationsSent": pks.properties.notificationsSent + 1,
          "properties.lastNotificationDate": new Date(),
        };

        // Jika masih ada sisa reminder, set tanggal reminder berikutnya (5 hari dari sekarang)
        if (updates["properties.notificationsSent"] < 4) {
          const nextReminderDate = new Date();
          nextReminderDate.setDate(nextReminderDate.getDate() + 5);
          updates["properties.reminderDate"] = nextReminderDate;
        } else {
          // Jika sudah 4 kali, nonaktifkan reminder secara otomatis
          updates["properties.isReminderActive"] = false;
        }

        await PKS.findByIdAndUpdate(pks._id, { $set: updates });
        console.log(
          `Reminder email sent for PKS: ${pks.content.nomor}. Count: ${updates["properties.notificationsSent"]}`
        );
      }
    } catch (error) {
      console.error("Error during reminder cron job execution:", error);
    }
  });
};
