// services/email.service.js
import nodemailer from "nodemailer";
import dotenv from "dotenv-flow";
dotenv.config();

// Konfigurasi transporter untuk nodemailer menggunakan Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Alamat email Gmail Anda
    pass: process.env.GMAIL_APP_PASSWORD, // App Password yang sudah Anda buat
  },
});

/**
 * Mengirim email notifikasi perubahan status PKS
 * @param {string} to - Alamat email penerima
 * @param {object} pksData - Data PKS (nomor, judul, status baru)
 */
export const sendStatusChangeNotification = async (to, pksData) => {
  const mailOptions = {
    from: `PKS LPPM UPNYK <${process.env.GMAIL_USER}>`,
    to: to,
    subject: `Perubahan Status PKS: ${pksData.nomor}`,
    html: `
      <h1>Notifikasi Perubahan Status PKS</h1>
      <p>Halo,</p>
      <p>Status untuk PKS dengan detail berikut telah diubah:</p>
      <ul>
        <li><strong>Nomor PKS:</strong> ${pksData.nomor}</li>
        <li><strong>Judul:</strong> ${pksData.judul}</li>
        <li><strong>Status Baru:</strong> ${pksData.status}</li>
      </ul>
      <p>Terima kasih.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Mengirim email reminder PKS
 * @param {string} to - Alamat email penerima
 * @param {object} pksData - Data PKS (nomor, judul)
 */
export const sendReminderEmail = async (to, pksData) => {
  const mailOptions = {
    from: `PKS LPPM UPNYK <${process.env.GMAIL_USER}>`,
    to: to,
    subject: `Reminder PKS: ${pksData.nomor}`,
    html: `
      <h1>Reminder Perjanjian Kerja Sama (PKS)</h1>
      <p>Halo,</p>
      <p>Ini adalah email pengingat untuk PKS dengan detail berikut:</p>
      <ul>
        <li><strong>Nomor PKS:</strong> ${pksData.nomor}</li>
        <li><strong>Judul:</strong> ${pksData.judul}</li>
      </ul>
      <p>Mohon untuk segera ditindaklanjuti. Terima kasih.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};
