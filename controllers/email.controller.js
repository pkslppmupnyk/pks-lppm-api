// controllers/email.controller.js
import PKS from "../models/pks.model.js";
import {
  sendStatusChangeNotification,
  sendReminderEmail,
} from "../services/email.service.js";

// START Reminder
export const startReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const pks = await PKS.findById(id);

    if (!pks) {
      return res.status(404).json({ message: "PKS not found" });
    }

    // Kirim email pertama kali secara langsung saat di-trigger
    await sendReminderEmail(pks.properties.email, {
      nomor: pks.content.nomor,
      judul: pks.content.judul,
    });

    // Set tanggal reminder berikutnya 5 hari dari sekarang
    const nextReminderDate = new Date();
    nextReminderDate.setDate(nextReminderDate.getDate() + 5);

    pks.properties.isReminderActive = true;
    pks.properties.notificationsSent = 1; // Sudah terkirim 1 kali
    pks.properties.reminderDate = nextReminderDate;
    pks.properties.lastNotificationDate = new Date();

    await pks.save();

    res
      .status(200)
      .json({
        message: "Reminder successfully started and first email sent",
        data: pks,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// STOP Reminder
export const stopReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const pks = await PKS.findByIdAndUpdate(
      id,
      { $set: { "properties.isReminderActive": false } },
      { new: true }
    );

    if (!pks) {
      return res.status(404).json({ message: "PKS not found" });
    }

    res
      .status(200)
      .json({ message: "Reminder successfully stopped", data: pks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Kirim notifikasi perubahan status
export const sendStatusNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const pks = await PKS.findById(id);

    if (!pks) {
      return res.status(404).json({ message: "PKS not found" });
    }

    await sendStatusChangeNotification(pks.properties.email, {
      nomor: pks.content.nomor,
      judul: pks.content.judul,
      status: pks.properties.status,
    });

    res
      .status(200)
      .json({ message: "Status change notification sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
