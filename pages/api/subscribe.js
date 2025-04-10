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
      from: 'Best Concert Ever <onboarding@resend.dev>',
      to: email,
      subject: '🎸 You’re Signed Up!',
      html: `<p>Thanks for signing up for Best Concert Ever! You'll get a daily prompt and yesterday’s winning lineup.</p>`,
    });

    return res.status(200).json({ message: 'Email sent' });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ message: 'Email failed' });
  }
}
