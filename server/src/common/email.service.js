/**
 * Email Service
 * Placeholder for email sending functionality
 *
 * TODO: Integrate with email provider (SendGrid, AWS SES, SMTP, etc.)
 * For now, this service logs email operations and returns success
 */

/**
 * Send email with optional attachments
 *
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.body - Email body (HTML or plain text)
 * @param {Array} params.attachments - Optional attachments
 *   - Each attachment: { filename: string, content: Buffer, contentType: string }
 * @returns {Promise<Object>} { success: boolean, messageId?: string }
 */
exports.sendEmail = async ({ to, subject, body, attachments = [] }) => {
  try {
    // TODO: Replace this with actual email provider integration
    // Examples:
    //
    // SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ to, from: process.env.FROM_EMAIL, subject, html: body, attachments });
    //
    // AWS SES:
    // const AWS = require('aws-sdk');
    // const ses = new AWS.SES({ region: process.env.AWS_REGION });
    // await ses.sendEmail({ ... }).promise();
    //
    // Nodemailer (SMTP):
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ to, subject, html: body, attachments });

    console.log("=".repeat(80));
    console.log("EMAIL SERVICE - PLACEHOLDER MODE");
    console.log("=".repeat(80));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body length: ${body?.length || 0} characters`);
    console.log(`Attachments: ${attachments.length}`);

    if (attachments.length > 0) {
      attachments.forEach((att, idx) => {
        console.log(`  [${idx + 1}] ${att.filename} (${att.contentType}) - ${att.content?.length || 0} bytes`);
      });
    }

    console.log("=".repeat(80));
    console.log("⚠️  Email NOT actually sent - this is a placeholder");
    console.log("⚠️  Configure email provider in /server/src/common/email.service.js");
    console.log("=".repeat(80));

    // Return success for development/testing
    return {
      success: true,
      messageId: `placeholder-${Date.now()}`,
      message: "Email logged (not sent - placeholder mode)",
    };
  } catch (error) {
    console.error("Email service error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Validate email address format
 *
 * @param {string} email - Email address to validate
 * @returns {boolean} true if valid email format
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = exports;
