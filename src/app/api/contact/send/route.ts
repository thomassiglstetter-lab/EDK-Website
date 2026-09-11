import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

const CONTACT_FILE = path.join(process.cwd(), "src", "data", "contact.json");
const MESSAGES_FILE = path.join(process.cwd(), "src", "data", "contact-messages.json");

interface ContactCategory {
  id: string;
  name: string;
  email: string;
  description?: string;
  active?: boolean;
}

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
  fromEmail: string;
  fromName: string;
}

interface ContactSettings {
  generalEmail: string;
  categories: ContactCategory[];
  smtp?: SmtpConfig;
}

export interface ContactMessage {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  category: string;
  targetEmail: string;
  message: string;
  read: boolean;
  mailSent: boolean;
  sendError?: string;
}

async function getContactSettings(): Promise<ContactSettings> {
  try {
    const raw = await fs.readFile(CONTACT_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading contact.json:", err);
    return {
      generalEmail: "kontakt@handballeintracht.de",
      categories: [],
    };
  }
}

async function getMessages(): Promise<ContactMessage[]> {
  try {
    const raw = await fs.readFile(MESSAGES_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveMessages(messages: ContactMessage[]): Promise<boolean> {
  try {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error saving messages:", err);
    return false;
  }
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // -------------------------------------------------------------
    // ACTION: TEST SMTP CONNECTION
    // -------------------------------------------------------------
    if (body.action === "testSmtp") {
      const { host, port, secure, user, password, fromEmail, fromName, testEmail } = body;

      if (!host || !user || !password) {
        return NextResponse.json(
          { error: "Bitte Host, Benutzername und Passwort angeben." },
          { status: 400 }
        );
      }
      if (!testEmail || !testEmail.includes("@")) {
        return NextResponse.json(
          { error: "Bitte eine gültige Test-Empfänger-Adresse angeben." },
          { status: 400 }
        );
      }

      const transporter = nodemailer.createTransport({
        host: host.trim(),
        port: Number(port) || 587,
        secure: Boolean(secure),
        auth: {
          user: user.trim(),
          pass: password.trim(),
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verify connection
      await transporter.verify();

      // Send test mail
      await transporter.sendMail({
        from: `"${fromName || "Eintracht Dachau-Karlsfeld Handball"}" <${fromEmail || user}>`,
        to: testEmail.trim(),
        subject: "[Test-Mail] Eintracht Dachau-Karlsfeld SMTP-Konfiguration",
        text: "Glückwunsch! Die SMTP-Einstellungen der Eintracht Dachau-Karlsfeld Website funktionieren einwandfrei.",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #0c111a; color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #222d3d;">
            <div style="background: linear-gradient(135deg, #0ea5e9, #8f1838); padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Eintracht Dachau-Karlsfeld</h1>
              <p style="color: #e2e8f0; margin: 6px 0 0 0; font-size: 14px;">SMTP-Verbindungstest erfolgreich</p>
            </div>
            <div style="padding: 24px; line-height: 1.6; color: #cbd5e1;">
              <p>Hallo,</p>
              <p>dein E-Mail-Server wurde erfolgreich angebunden. Zukünftige Kontaktanfragen über die Website werden automatisch an die jeweilige Kategorie-Adresse zugestellt.</p>
              <div style="background: rgba(255,255,255,0.05); padding: 14px; border-radius: 8px; font-size: 13px; margin: 16px 0;">
                <div><strong>Server:</strong> ${host}:${port}</div>
                <div><strong>Absender:</strong> ${fromEmail || user}</div>
                <div><strong>Empfänger:</strong> ${testEmail}</div>
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Diese Testnachricht wurde vom Adminbereich generiert.</p>
            </div>
          </div>
        `,
      });

      return NextResponse.json({ success: true, message: "Test-E-Mail erfolgreich versendet!" });
    }

    // -------------------------------------------------------------
    // ACTION: SEND CONTACT FORM MESSAGE
    // -------------------------------------------------------------
    const { name, email, category, message } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Bitte deinen Namen angeben." }, { status: 400 });
    }
    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse angeben." }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Bitte eine Nachricht eingeben." }, { status: 400 });
    }

    const settings = await getContactSettings();

    // Determine target recipient email
    let targetEmail = settings.generalEmail || "kontakt@handballeintracht.de";
    if (category && settings.categories) {
      const match = settings.categories.find(
        (c) => c.name.toLowerCase() === category.toLowerCase() || c.id === category
      );
      if (match && match.email) {
        targetEmail = match.email;
      }
    }

    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newMsg: ContactMessage = {
      id: msgId,
      createdAt: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      category: category || "Allgemeine Vereinsanfrage",
      targetEmail: targetEmail.trim(),
      message: message.trim(),
      read: false,
      mailSent: false,
    };

    // Attempt SMTP dispatch if configured
    const smtp = settings.smtp;
    const isSmtpConfigured = Boolean(
      smtp && smtp.host && smtp.user && smtp.password && smtp.host.trim() !== ""
    );

    if (isSmtpConfigured && smtp) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtp.host.trim(),
          port: Number(smtp.port) || 587,
          secure: Boolean(smtp.secure),
          auth: {
            user: smtp.user.trim(),
            pass: smtp.password ? smtp.password.trim() : "",
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        const formattedDate = new Date().toLocaleString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        await transporter.sendMail({
          from: `"${smtp.fromName || "Eintracht Website"}" <${smtp.fromEmail || smtp.user}>`,
          to: targetEmail,
          replyTo: `"${name.trim()}" <${email.trim()}>`,
          subject: `[Kontaktanfrage Website] ${category} – von ${name.trim()}`,
          text: `Neue Kontaktanfrage über die Eintracht Dachau-Karlsfeld Website\n\nKategorie: ${category}\nDatum: ${formattedDate}\nAbsender: ${name.trim()} (${email.trim()})\n\nNachricht:\n${message.trim()}\n\nAntworten Sie einfach auf diese E-Mail, um direkt mit ${name.trim()} in Kontakt zu treten.`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0c111a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
              {/* Header */}
              <div style="background: linear-gradient(135deg, #0ea5e9 0%, #8f1838 100%); padding: 28px 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">Eintracht Dachau-Karlsfeld</h1>
                <div style="display: inline-block; margin-top: 8px; padding: 4px 12px; border-radius: 20px; background: rgba(0,0,0,0.25); color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                  Neue Kontaktanfrage
                </div>
              </div>

              {/* Body */}
              <div style="padding: 28px 24px;">
                <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; margin-bottom: 22px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="color: #94a3b8; padding: 6px 0; width: 130px;">Bereich:</td>
                      <td style="color: #38bdf8; font-weight: 600; padding: 6px 0;">${category}</td>
                    </tr>
                    <tr>
                      <td style="color: #94a3b8; padding: 6px 0;">Absender:</td>
                      <td style="color: #ffffff; font-weight: 600; padding: 6px 0;">${name.trim()}</td>
                    </tr>
                    <tr>
                      <td style="color: #94a3b8; padding: 6px 0;">E-Mail-Adresse:</td>
                      <td style="padding: 6px 0;"><a href="mailto:${email.trim()}" style="color: #38bdf8; text-decoration: none;">${email.trim()}</a></td>
                    </tr>
                    <tr>
                      <td style="color: #94a3b8; padding: 6px 0;">Empfänger-Postfach:</td>
                      <td style="color: #cbd5e1; padding: 6px 0;">${targetEmail}</td>
                    </tr>
                    <tr>
                      <td style="color: #94a3b8; padding: 6px 0;">Datum / Uhrzeit:</td>
                      <td style="color: #cbd5e1; padding: 6px 0;">${formattedDate} Uhr</td>
                    </tr>
                  </table>
                </div>

                {/* Message Content */}
                <div style="margin-bottom: 26px;">
                  <div style="font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">
                    Nachricht:
                  </div>
                  <div style="background: rgba(255, 255, 255, 0.02); border-left: 3px solid #0ea5e9; padding: 14px 18px; border-radius: 0 8px 8px 0; color: #f1f5f9; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
${message.trim()}
                  </div>
                </div>

                {/* Direct Reply Button */}
                <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08);">
                  <a href="mailto:${email.trim()}?subject=${encodeURIComponent(`Re: [Eintracht Dachau-Karlsfeld] Deine Anfrage bezüglich ${category}`)}" style="display: inline-block; background: #0ea5e9; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    Direkt per E-Mail antworten ↗
                  </a>
                  <p style="color: #64748b; font-size: 12px; margin-top: 12px;">
                    Sie können auch einfach direkt auf diese Benachrichtigungs-E-Mail antworten.
                  </p>
                </div>
              </div>
            </div>
          `,
        });

        // 2. Automated Confirmation Receipt to the Sender / Visitor
        try {
          await transporter.sendMail({
            from: `"${smtp.fromName || "HSG Eintracht Dachau-Karlsfeld"}" <${smtp.fromEmail || smtp.user}>`,
            to: email.trim(),
            subject: `Eingangsbestätigung: Deine Anfrage an die HSG Eintracht Dachau-Karlsfeld`,
            text: `Hallo ${name.trim()},\n\nvielen Dank für deine Kontaktaufnahme mit der HSG Eintracht Dachau-Karlsfeld Handball!\n\nWir haben deine Nachricht zum Thema "${category}" erfolgreich erhalten. Unser Team prüft dein Anliegen und meldet sich in der Regel innerhalb von 1–2 Werktagen bei dir.\n\nZusammenfassung deiner Anfrage:\n- Datum: ${formattedDate} Uhr\n- Bereich: ${category}\n- Empfänger: ${targetEmail}\n\nDeine Nachricht:\n${message.trim()}\n\nSportliche Grüße,\nHSG Eintracht Dachau-Karlsfeld Handball`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0c111a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
                <div style="background: linear-gradient(135deg, #0ea5e9 0%, #8f1838 100%); padding: 32px 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">HSG Eintracht Dachau-Karlsfeld</h1>
                  <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 14px;">Eingangsbestätigung deiner Kontaktanfrage</p>
                </div>

                <div style="padding: 28px 24px; line-height: 1.6; color: #cbd5e1;">
                  <p style="font-size: 16px; color: #ffffff; margin-top: 0;">
                    Hallo <strong>${name.trim()}</strong>,
                  </p>
                  <p>
                    vielen Dank für dein Interesse und deine Nachricht an die <strong>HSG Eintracht Dachau-Karlsfeld Handball</strong>!
                  </p>
                  <p>
                    Deine Anfrage zum Thema <span style="color: #38bdf8; font-weight: 600;">${category}</span> ist erfolgreich bei uns eingegangen und wurde an unser zuständiges Team weitergeleitet. Wir bearbeiten dein Anliegen schnellstmöglich und melden uns in der Regel innerhalb von <strong>1–2 Werktagen</strong> bei dir.
                  </p>

                  <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; margin: 24px 0;">
                    <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; font-weight: 600;">
                      Deine übermittelten Daten
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                      <tr>
                        <td style="color: #94a3b8; padding: 5px 0; width: 110px;">Bereich:</td>
                        <td style="color: #ffffff; font-weight: 600; padding: 5px 0;">${category}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8; padding: 5px 0;">Datum:</td>
                        <td style="color: #ffffff; padding: 5px 0;">${formattedDate} Uhr</td>
                      </tr>
                    </table>

                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                      <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">Deine Nachricht:</div>
                      <div style="color: #f1f5f9; font-size: 14px; white-space: pre-wrap; font-style: italic;">"${message.trim()}"</div>
                    </div>
                  </div>

                  <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">
                    Solltest du dringende Fragen haben oder zusätzliche Informationen nachreichen wollen, antworte einfach direkt auf diese E-Mail.
                  </p>
                </div>

                <div style="background: rgba(255, 255, 255, 0.02); padding: 18px 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; color: #64748b;">
                  <div>HSG Eintracht Dachau-Karlsfeld Handball</div>
                  <div style="margin-top: 4px;">Dachau & Karlsfeld • Spielgemeinschaft des TSV Dachau 1865 & TSV Eintracht Karlsfeld</div>
                </div>
              </div>
            `,
          });
        } catch (confirmErr) {
          console.error("Confirmation email to sender failed (non-blocking):", confirmErr);
        }

        newMsg.mailSent = true;
      } catch (mailErr: any) {
        console.error("SMTP sending error:", mailErr);
        newMsg.mailSent = false;
        newMsg.sendError = mailErr.message || "Fehler beim E-Mail-Versand";
      }
    } else {
      newMsg.mailSent = false;
      newMsg.sendError = "Keine SMTP-Zugangsdaten konfiguriert (Nachricht im Posteingang gespeichert).";
    }

    // Always persist into messages inbox so no message is ever lost
    const messages = await getMessages();
    messages.unshift(newMsg);
    await saveMessages(messages);

    return NextResponse.json({
      success: true,
      mailSent: newMsg.mailSent,
      targetEmail: newMsg.targetEmail,
      smtpConfigured: isSmtpConfigured,
      message: newMsg.mailSent
        ? `Deine Nachricht wurde erfolgreich an ${targetEmail} gesendet!`
        : "Deine Nachricht wurde erfolgreich im System registriert!",
    });
  } catch (err: any) {
    console.error("Error in /api/contact/send:", err);
    return NextResponse.json(
      { error: err.message || "Fehler beim Verarbeiten der Nachricht." },
      { status: 500 }
    );
  }
}
