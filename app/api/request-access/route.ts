import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
  try {
    const body = await req.json();
    const { email, company, agents_count, notes, name, role } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
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

    // 1. Save to Supabase (matching the user's actual table structure)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { error: dbError } = await supabase
        .from('waitlist')
        .insert([{ 
          email, 
          company: company || 'N/A', 
          agents_count: parseInt(agents_count) || 0, 
          notes: notes || `Role: ${role || 'N/A'}, Name: ${name || 'N/A'}` // Storing extra info in notes
        }]);
      
      if (dbError) {
        console.error('Supabase Error:', dbError);
      }
    }

    // 2. Notify Slack (if configured)
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚀 *New Waitlist Signup!*\n*Email:* ${email}\n*Company:* ${company || 'N/A'}\n*Agents:* ${agents_count || '0'}\n*Notes:* ${notes || 'N/A'}`,
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
          to: process.env.FOUNDER_EMAIL || email,
          subject: `New Pilot Request from ${company || email}`,
          text: `Email: ${email}\nCompany: ${company || 'N/A'}\nAgents: ${agents_count || '0'}\nNotes: ${notes || 'N/A'}`,
        });

        // To User (Confirmation)
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: email,
          subject: 'Welcome to the StateLock Private Beta',
          text: `Hi,\n\nThanks for joining the StateLock private beta list! We're excited to have you.\n\nOur team will review your application and reach out within 24 hours to discuss the deterministic governance program.\n\nBest,\nThe StateLock Team`,
        });
      } catch (resendErr) {
        console.error('Resend Error:', resendErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your request has been submitted.',
    });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json(
      { success: false, error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
