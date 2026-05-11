import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    const { email, company, agents_count, notes } = body

    // 1. SAVE TO SUPABASE
    const { error } = await supabase
      .from('waitlist')
      .insert([{
        email,
        company,
        agents_count,
        notes,
        source: 'landing-page'
      }])

    if (error && error.code !== '23505') {
      console.error('Supabase Error:', error)
      return NextResponse.json(
        { error: `Supabase Error: ${error.message || 'Unknown'}` }, 
        { status: 500 }
      )
    }

    // 2. SEND TO SLACK
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🧠 *New Company Brain Lead!*\n` +
                `📧 Email: ${email}\n` +
                `🏢 Company: ${company}\n` +
                `🤖 Agents in prod: ${agents_count}\n` +
                `📝 Notes: ${notes || 'N/A'}\n` +
                `🕐 Time: ${new Date().toISOString()}`
        })
      })
    }

    // 3. SEND AUTO-REPLY VIA RESEND
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Aditya from Company Brain <aditya@companybrain.ai>',
          to: email,
          subject: 'You are on the list.',
          html: `
            <div style="background:#000;color:#fff;
                        font-family:sans-serif;padding:40px;
                        max-width:600px;border: 1px solid #1a1a1a">
              <p style="color:#60FFB4;font-size:12px;
                        letter-spacing:0.1em;font-family:monospace">
                COMPANY BRAIN · PRIVATE BETA
              </p>
              <h1 style="font-size:28px;margin:24px 0">
                You're on the list.
              </h1>
              <p style="color:#888;line-height:1.6">
                Hey — I got your request for <strong>${company}</strong>. 
                We're onboarding 5 enterprise partners 
                this month and I'll personally reach out 
                within 24 hours to set up a call.
              </p>
              <p style="color:#888;line-height:1.6;
                        margin-top:16px">
                In the meantime, reply to this email with 
                any questions. I read every reply.
              </p>
              <div style="margin-top:40px;
                          border-top:1px solid #1a1a1a;
                          padding-top:24px">
                <p style="color:#444;font-size:12px">
                  — Aditya<br>
                  Founder, Company Brain<br>
                  Built in Chhatrapati Sambhajinagar 🇮🇳
                </p>
              </div>
            </div>
          `
        })
      })
    }

    // 4. SAVE TO GOOGLE SHEETS
    if (process.env.GOOGLE_SHEETS_WEBHOOK) {
      await fetch(process.env.GOOGLE_SHEETS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          company,
          agents_count,
          notes,
          timestamp: new Date().toISOString(),
          source: 'landing-page'
        })
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist API Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
