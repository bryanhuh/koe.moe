// Supabase Auth Hook → Resend transactional email delivery.
//
// Setup (one-time, in Supabase Dashboard):
//   1. Authentication → Hooks → "Send Email" → set to this function's URL
//   2. Copy the generated hook secret (looks like "v1,whsec_..."), then run:
//        supabase secrets set SEND_EMAIL_HOOK_SECRET=<secret>
//        supabase secrets set RESEND_API_KEY=<your-resend-key>
//   3. Optional: verify a sending domain in Resend, then set SEND_EMAIL_FROM.
//      Until then the sandbox sender only delivers to your Resend account email.
//
// Auth hooks are signed with the Standard Webhooks scheme — the payload is
// verified via the webhook-id / webhook-timestamp / webhook-signature headers,
// NOT an "Authorization: Bearer" header.

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
// Sender address. Defaults to Resend's sandbox sender, which works without a
// verified domain but only delivers to your own Resend account email. Once a
// domain is verified in Resend, set the SEND_EMAIL_FROM secret to override:
//   supabase secrets set SEND_EMAIL_FROM="Koe <noreply@koe.moe>"
const FROM = Deno.env.get("SEND_EMAIL_FROM") ?? "Koe <onboarding@resend.dev>";

interface HookPayload {
  user: { id: string; email: string };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const raw = await req.text();

  let user: HookPayload["user"];
  let email_data: HookPayload["email_data"];

  if (HOOK_SECRET) {
    // Standard Webhooks verification. The dashboard secret is "v1,whsec_<base64>";
    // the library expects just the base64 portion.
    const wh = new Webhook(HOOK_SECRET.replace(/^v1,whsec_/, ""));
    try {
      ({ user, email_data } = wh.verify(
        raw,
        Object.fromEntries(req.headers),
      ) as HookPayload);
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Unauthorized", { status: 401 });
    }
  } else {
    ({ user, email_data } = JSON.parse(raw) as HookPayload);
  }

  const actionUrl =
    `${email_data.site_url}/auth/v1/verify` +
    `?token=${email_data.token_hash}` +
    `&type=${email_data.email_action_type}` +
    `&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;

  const { subject, html } = buildTemplate(email_data.email_action_type, actionUrl);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: user.email, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend error:", body);
    return new Response(JSON.stringify({ error: body }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

function buildTemplate(
  actionType: string,
  url: string,
): { subject: string; html: string } {
  const templates: Record<string, { subject: string; cta: string; body: string }> = {
    magiclink: {
      subject: "Your Koe sign-in link",
      cta: "Sign in to Koe",
      body: "Click below to sign in. This link expires in 1 hour and can only be used once.",
    },
    signup: {
      subject: "Verify your Koe email",
      cta: "Verify email",
      body: "Click below to verify your email address and activate your account.",
    },
    recovery: {
      subject: "Recover your Koe account",
      cta: "Recover access",
      body: "Click below to sign back in and regain access to your account.",
    },
    email_change_current: {
      subject: "Confirm your Koe email change",
      cta: "Confirm change",
      body: "Click below to confirm that you want to change your email address.",
    },
    email_change_new: {
      subject: "Confirm your new Koe email",
      cta: "Confirm new email",
      body: "Click below to confirm your new email address.",
    },
  };

  const t = templates[actionType] ?? {
    subject: "Action required — Koe",
    cta: "Continue",
    body: "Click below to continue.",
  };

  return { subject: t.subject, html: renderEmail(t.body, url, t.cta) };
}

function renderEmail(body: string, url: string, cta: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="background:#0a0a0a;color:#e5e5e5;font-family:ui-monospace,'Cascadia Code',monospace;margin:0;padding:48px 16px">
  <div style="max-width:480px;margin:0 auto">
    <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:36px">
      Koe<span style="color:#1ed760">.</span>
    </div>
    <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#a3a3a3">${body}</p>
    <a
      href="${url}"
      style="display:inline-block;background:#1ed760;color:#000;font-weight:700;font-size:14px;padding:13px 28px;border-radius:6px;text-decoration:none;letter-spacing:-0.2px"
    >${cta}</a>
    <p style="margin:36px 0 0;font-size:11px;color:#404040;line-height:1.5">
      If you didn't request this email you can safely ignore it.<br>
      This link expires in 1 hour.
    </p>
  </div>
</body>
</html>`;
}
