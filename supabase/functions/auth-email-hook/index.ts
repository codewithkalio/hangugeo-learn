import { Webhook } from "@lovable.dev/webhooks-js";
import { LovableEmail } from "@lovable.dev/email-js";
import { render } from "npm:@react-email/components@0.0.22";
import { SignupEmail } from "../_shared/email-templates/signup.tsx";
import { RecoveryEmail } from "../_shared/email-templates/recovery.tsx";
import { InviteEmail } from "../_shared/email-templates/invite.tsx";
import { MagicLinkEmail } from "../_shared/email-templates/magic-link.tsx";
import { EmailChangeEmail } from "../_shared/email-templates/email-change.tsx";
import { ReauthenticationEmail } from "../_shared/email-templates/reauthentication.tsx";

const SITE_NAME = "한국어 Learn";

Deno.serve(async (req) => {
  try {
    const webhook = new Webhook(Deno.env.get("LOVABLE_API_KEY") ?? "");
    const payload = await webhook.verify(req);
    const { email_data, email_type } = payload as any;
    const {
      token_hash,
      redirect_to,
      email_action_type,
      site_url,
      token,
      ...rest
    } = email_data ?? {};

    const confirmationUrl =
      `${site_url ?? ""}${redirect_to ?? ""}?token_hash=${token_hash ?? ""}&type=${email_action_type ?? ""}`;

    const recipient = rest?.email ?? "";
    const newEmail = rest?.new_email ?? "";

    let subject = "";
    let html = "";

    switch (email_action_type ?? email_type) {
      case "signup": {
        subject = `Welcome to ${SITE_NAME} — confirm your email`;
        html = await render(SignupEmail({ confirmationUrl, siteName: SITE_NAME, recipient }));
        break;
      }
      case "recovery": {
        subject = `Reset your ${SITE_NAME} password`;
        html = await render(RecoveryEmail({ confirmationUrl, siteName: SITE_NAME, recipient }));
        break;
      }
      case "invite": {
        subject = `You're invited to ${SITE_NAME}!`;
        html = await render(InviteEmail({ confirmationUrl, siteName: SITE_NAME, recipient }));
        break;
      }
      case "magiclink": {
        subject = `Your ${SITE_NAME} sign-in link`;
        html = await render(MagicLinkEmail({ confirmationUrl, siteName: SITE_NAME, recipient }));
        break;
      }
      case "email_change": {
        subject = `Confirm your new email for ${SITE_NAME}`;
        html = await render(EmailChangeEmail({ confirmationUrl, siteName: SITE_NAME, recipient, newEmail }));
        break;
      }
      case "reauthentication": {
        subject = `Your ${SITE_NAME} verification code`;
        html = await render(ReauthenticationEmail({ token: token ?? "", siteName: SITE_NAME, recipient }));
        break;
      }
      default: {
        return new Response(JSON.stringify({ error: "Unknown email type" }), { status: 400 });
      }
    }

    const emailClient = new LovableEmail(Deno.env.get("LOVABLE_API_KEY") ?? "");
    await emailClient.send({
      to: [recipient],
      subject,
      html,
      callback_url: (payload as any).callback_url,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Auth email hook error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
