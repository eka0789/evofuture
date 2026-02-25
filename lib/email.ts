// Email service utility
// In production, integrate with SendGrid, AWS SES, or similar

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  // Development: Log email instead of sending
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent:', {
      to: options.to,
      subject: options.subject,
      preview: options.text || options.html.substring(0, 100),
    });
    return { success: true, messageId: 'dev-' + Date.now() };
  }

  // Production: Integrate with email service
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: options.to,
    from: process.env.EMAIL_FROM,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };
  
  return await sgMail.send(msg);
  */

  return { success: true, messageId: 'not-configured' };
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Evolution Future!',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining Evolution Future.</p>
      <p>Get started by exploring your dashboard.</p>
    `,
    text: `Welcome ${name}! Thank you for joining Evolution Future.`,
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `,
    text: `Reset your password: ${resetUrl}`,
  });
}

export async function sendNotificationEmail(email: string, notification: any) {
  return sendEmail({
    to: email,
    subject: notification.title,
    html: `
      <h2>${notification.title}</h2>
      <p>${notification.message}</p>
    `,
    text: `${notification.title}: ${notification.message}`,
  });
}
