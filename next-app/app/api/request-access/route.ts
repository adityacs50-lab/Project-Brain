import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
  try {
    const body = await req.json();
    const { name, email, company, role } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Save to Supabase (if configured)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { error: dbError } = await supabase
        .from('waitlist')
        .insert([{ name, email, company, role, created_at: new Date().toISOString() }]);
      
      if (dbError) {
        console.error('Supabase Error:', dbError);
        // We continue even if DB fails, or you might want to return error
      }
    }

    // 2. Notify Slack (if configured)
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚀 *New Waitlist Signup!*\n*Name:* ${name}\n*Email:* ${email}\n*Company:* ${company || 'N/A'}\n*Role:* ${role || 'N/A'}`,
          }),
        });
      } catch (slackErr) {
        console.error('Slack Notification Error:', slackErr);
      }
    }

    // 3. Send Email via Resend (if configured)
    if (process.env.RESEND_API_KEY) {
      try {
        // To Founder
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.FOUNDER_EMAIL || email, // Fallback to user if founder not set
          subject: `New Pilot Request: ${name} from ${company || 'Unknown'}`,
          text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nRole: ${role || 'N/A'}`,
        });

        // To User (Confirmation)
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: email,
          subject: 'Welcome to the StateLock Private Beta',
          text: `Hi ${name},\n\nThanks for joining the StateLock private beta list! We're excited to have you.\n\nOur team will review your application and reach out within 24 hours to discuss the deterministic governance program.\n\nBest,\nThe StateLock Team`,
        });
      } catch (resendErr) {
        console.error('Resend Error:', resendErr);
      }
    }

    console.log(`--- New Access Request: ${email} ---`);

    return NextResponse.json({
      success: true,
      message: 'Your request has been submitted. We\'ll be in touch soon.',
    });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
