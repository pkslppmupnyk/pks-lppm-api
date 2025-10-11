// services/email.service.js
import nodemailer from "nodemailer";
import dotenv from "dotenv-flow";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// --- GANTI FUNGSI sendStatusChangeNotification DENGAN YANG INI ---
/**
 * Mengirim email notifikasi perubahan status PKS yang dinamis
 * @param {object} pks - Objek PKS lengkap dari database
 */
export const sendStatusNotification = async (pks) => {
  const pksNomorEncoded = encodeURIComponent(pks.content.nomor);
  const detailLink = `${process.env.CLIENT_URL}/track/${pks.id}`;

  const mailOptions = {
    from: `PKS LPPM UPNYK <${process.env.GMAIL_USER}>`,
    to: pks.properties.email,
    subject: `Pemberitahuan Status PKS: ${pks.content.nomor}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #4CAF50;">Pemberitahuan Perubahan Status Pengajuan PKS Anda</h1>
        <p>Terima kasih telah mengajukan Perjanjian Kerja Sama (PKS) melalui sistem kami.</p>
        <p>Dengan ini kami memberitahukan bahwa ada pembaruan untuk pengajuan Anda dengan detail:</p>
        <ul style="list-style: none; padding-left: 0;">
            <li><strong>Judul:</strong> ${pks.content.judul}</li>
            <li><strong>Nomor PKS:</strong> ${pks.content.nomor}</li>
        </ul>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p>Status pengajuan Anda saat ini adalah:</p>
        <p style="font-size: 1.2em; font-weight: bold; color: #0275d8;">
            ${pks.properties.status.toUpperCase()}
        </p>
        ${
          pks.properties.comment
            ? `<p><strong>Catatan dari Admin:</strong><br/><em>${pks.properties.comment}</em></p>`
            : ""
        }
        <p>Anda dapat melihat detail pengajuan Anda melalui tautan di bawah ini:</p>
        <a href="${detailLink}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Lihat Detail PKS
        </a>
        <p style="margin-top: 30px; font-size: 0.9em; color: #777;">
            Hormat kami,<br>
            Tim LPPM UPN "Veteran" Yogyakarta
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ... (fungsi sendReminderEmail tidak perlu diubah)

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
