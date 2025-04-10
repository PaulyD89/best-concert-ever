import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // use Resend's test sender for now
      to: email,
      subject: '🎸 You’re Signed Up!',
      html: `<p>Thanks for signing up for <strong>Best Concert Ever</strong>!<br/>You'll now get the daily prompt and the winning lineup from yesterday.</p>`,
    });

    return res.status(200).json({ message: 'Email sent' });
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ message: 'Email failed', error: err.message });
  }
}
