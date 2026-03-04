const { EmailClient } = require('@azure/communication-email');

module.exports = async function (context, req) {
    context.log('Baby Point Barbershop — contact form submission received');

    try {
        const { name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            context.res = {
                status: 400,
                body: { success: false, error: 'Name, email, and message are required.' }
            };
            return;
        }

        // Basic email format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            context.res = {
                status: 400,
                body: { success: false, error: 'Please provide a valid email address.' }
            };
            return;
        }

        const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
        const senderAddress    = process.env.AZURE_COMMUNICATION_SENDER_ADDRESS;

        if (!connectionString || !senderAddress) {
            context.log.error('Azure Communication Services not configured');
            context.res = {
                status: 500,
                body: { success: false, error: 'Email service not configured. Please contact us directly.' }
            };
            return;
        }

        const emailClient = new EmailClient(connectionString);

        const emailMessage = {
            senderAddress,
            content: {
                subject: `Website Message: ${subject || 'General Enquiry'} — from ${name}`,
                plainText: [
                    'New contact form submission from babypointbarbershop.ca',
                    '',
                    `Name:    ${name}`,
                    `Email:   ${email}`,
                    `Phone:   ${phone || 'Not provided'}`,
                    `Subject: ${subject || 'General Enquiry'}`,
                    '',
                    'Message:',
                    message,
                ].join('\n'),
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
                        <div style="background: #141414; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
                            <p style="color: #888; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 4px;">THE</p>
                            <p style="color: #f0f0f0; font-size: 22px; font-weight: 700; margin: 0 0 2px;">Baby Point</p>
                            <p style="color: #5BC8C8; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin: 0;">BARBERSHOP</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 28px; border-radius: 0 0 8px 8px;">
                            <h2 style="margin: 0 0 20px; font-size: 18px;">New Contact Form Message</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr style="border-bottom: 1px solid #e0e0e0;">
                                    <td style="padding: 10px 0; color: #666; font-size: 14px; width: 90px;"><strong>Name</strong></td>
                                    <td style="padding: 10px 0; font-size: 14px;">${name}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #e0e0e0;">
                                    <td style="padding: 10px 0; color: #666; font-size: 14px;"><strong>Email</strong></td>
                                    <td style="padding: 10px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #5BC8C8;">${email}</a></td>
                                </tr>
                                <tr style="border-bottom: 1px solid #e0e0e0;">
                                    <td style="padding: 10px 0; color: #666; font-size: 14px;"><strong>Phone</strong></td>
                                    <td style="padding: 10px 0; font-size: 14px;">${phone || 'Not provided'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px;"><strong>Subject</strong></td>
                                    <td style="padding: 10px 0; font-size: 14px;">${subject || 'General Enquiry'}</td>
                                </tr>
                            </table>
                            <div style="margin-top: 24px;">
                                <p style="color: #666; font-size: 13px; font-weight: 600; margin: 0 0 8px;">MESSAGE</p>
                                <p style="white-space: pre-wrap; line-height: 1.65; font-size: 14px; margin: 0;">${message}</p>
                            </div>
                            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0 16px;">
                            <p style="color: #999; font-size: 12px; margin: 0;">Sent from the Baby Point Barbershop website contact form.</p>
                        </div>
                    </div>
                `.trim()
            },
            recipients: {
                // UPDATE: replace with the barbershop's actual email address
                to: [{ address: 'info@babypointbarbershop.ca' }]
            },
            replyTo: [{ address: email, displayName: name }]
        };

        const poller = await emailClient.beginSend(emailMessage);
        await poller.pollUntilDone();

        context.log(`Contact form email sent from ${email}`);

        context.res = {
            status: 200,
            body: { success: true, message: "Message received! We'll be in touch shortly." }
        };

    } catch (error) {
        context.log.error('Error processing contact form:', error);
        context.res = {
            status: 500,
            body: {
                success: false,
                error: 'Unable to send your message. Please try again or reach us via Instagram or Facebook.'
            }
        };
    }
};
