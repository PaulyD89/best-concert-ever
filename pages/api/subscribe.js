import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ message: 'Invalid email' });

  try {
    // Save email to Supabase
    const { error: insertError } = await supabase.from('subscribers').insert([{ email }]);
    if (insertError) {
      console.error('Insert error:', insertError);
    }

    // Send welcome email
    await resend.emails.send({
    from: 'Best Concert Ever <noreply@bestconcertevergame.com>',
      to: email,
      subject: '🎸 You’re Signed Up!',
      html: `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #000; color: white; border-radius: 12px; border: 2px solid #f66;">
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://best-concert-ever.vercel.app/circularlogo.png" alt="Best Concert Ever Logo" width="180" height="180" style="border-radius: 50%; display: block; margin: 0 auto;" />
    </div>
    <h1 style="text-align: center; font-size: 24px; color: #ffee33; text-transform: uppercase; font-weight: bold; margin-bottom: 12px;">
      You’re Signed Up!
    </h1>
    <p style="font-size: 16px; text-align: center; margin-bottom: 24px;">
      Thanks for joining <strong>Best Concert Ever</strong>.<br />
      You’ll get a daily prompt + the winning lineup from the day before.
    </p>
    <p style="text-align: center; font-size: 12px; color: gray;">
      You can unsubscribe at any time from the footer of any email.
    </p>
    <p style="margin-top: 30px; font-size: 11px; color: gray; text-align: center;">
      © 2025 Thirty Bucks, LLC. All rights reserved.
    </p>
  </div>
`,
    });

    return res.status(200).json({ message: 'Email sent' });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ message: 'Email failed' });
  }
}
