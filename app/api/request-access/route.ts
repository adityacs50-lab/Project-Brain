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
          notes: `Name: ${name || 'N/A'} | Role: ${role || 'N/A'} | Notes: ${notes || 'N/A'}` 
        }]);
      
      if (dbError) {
        console.error('Supabase Error:', dbError);
      }
    }

    // 2. Notify Slack (Improved Error Logging)
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        const slackRes = await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚀 *New Pilot Request!*\n*Name:* ${name || 'N/A'}\n*Email:* ${email}\n*Company:* ${company || 'N/A'}\n*Role:* ${role || 'N/A'}\n*Agents:* ${agents_count || '0'}\n*Notes:* ${notes || 'N/A'}`,
          }),
        });
        
        if (!slackRes.ok) {
          const slackError = await slackRes.text();
          console.error('Slack Response Error:', slackError);
        }
      } catch (slackErr) {
        console.error('Slack Connection Error:', slackErr);
      }
    }

    // 3. Update Google Sheets (if configured)
    if (process.env.GOOGLE_SHEETS_WEBHOOK) {
      try {
        await fetch(process.env.GOOGLE_SHEETS_WEBHOOK, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || 'N/A',
            email,
            company: company || 'N/A',
            role: role || 'N/A',
            agents_count: agents_count || '0',
            notes: notes || 'N/A',
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (sheetErr) {
        console.error('Google Sheets Error:', sheetErr);
      }
    }

    // 4. Send Email via Resend (if configured)
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('placeholder')) {
      try {
        // To Founder
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.FOUNDER_EMAIL || 'adityacs50@gmail.com', // fallback to founder
          subject: `New Pilot Request: ${company || email}`,
          text: `Name: ${name || 'N/A'}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nRole: ${role || 'N/A'}\nAgents: ${agents_count || '0'}\nNotes: ${notes || 'N/A'}`,
        });

        // To User (Confirmation)
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: email,
          subject: 'Welcome to the StateLock Private Beta',
          text: `Hi ${name || 'there'},\n\nThanks for joining the StateLock private beta list! We're excited to have you.\n\nOur team will review your application and reach out within 24 hours to discuss the deterministic governance program.\n\nBest,\nThe StateLock Team`,
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
