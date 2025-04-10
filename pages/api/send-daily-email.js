import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { data: subs, error } = await supabase.from('subscribers').select('email');

  if (error || !subs) {
    console.error('Error fetching subscribers:', error);
    return res.status(500).json({ message: 'Failed to fetch subscribers' });
  }

  const recipients = subs.map((s) => s.email);

  try {
    await resend.emails.send({
      from: 'Best Concert Ever <onboarding@resend.dev>',
      to: recipients,
      subject: '🎸 Your Daily Prompt Is Coming Soon!',
      html: `<p>This is a test of your daily email system. Stay tuned for tomorrow’s Best Concert Ever lineup and prompt!</p>`,
    });

    return res.status(200).json({ message: 'Emails sent' });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ message: 'Failed to send emails' });
  }
}
