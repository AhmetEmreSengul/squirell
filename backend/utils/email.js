import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  emailVerification: (data) => ({
    subject: "Verify Your Email - Squirell",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Squirell</h1>
          <p style="color: white; margin: 10px 0 0 0;">Fractional Investment Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to Squirell!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${data.name},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for registering with Squirell! To complete your registration and start investing in fractional assets, please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <p style="color: #667eea; word-break: break-all; margin-bottom: 20px;">
            ${data.verificationUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 24 hours. If you didn't create an account with Squirell, you can safely ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Squirell Team
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2024 Squirell. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  passwordReset: (data) => ({
    subject: "Reset Your Password - Squirell",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Squirell</h1>
          <p style="color: white; margin: 10px 0 0 0;">Fractional Investment Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${data.name},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Squirell account. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <p style="color: #667eea; word-break: break-all; margin-bottom: 20px;">
            ${data.resetUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Squirell Team
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2024 Squirell. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  welcome: (data) => ({
    subject: "Welcome to Squirell!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Squirell</h1>
          <p style="color: white; margin: 10px 0 0 0;">Fractional Investment Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to Squirell!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${data.name},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to Squirell! Your account has been successfully created and verified. You're now ready to start your journey into fractional investment.
          </p>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Browse available investment opportunities</li>
              <li>Create your first product listing</li>
              <li>Set up your investment profile</li>
              <li>Connect with other investors</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Squirell Team
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2024 Squirell. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  reviewApproved: (data) => ({
    subject: "Your Review Has Been Approved - Squirell",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Squirell</h1>
          <p style="color: white; margin: 10px 0 0 0;">Fractional Investment Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Review Approved!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${data.name},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your review "${data.reviewTitle}" has been approved and is now live on our platform.
          </p>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Review Details:</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Title:</strong> ${data.reviewTitle}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Rating:</strong> ${data.rating}/5</p>
            <p style="color: #666; margin: 5px 0;"><strong>Status:</strong> Approved</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for contributing to our community! Your feedback helps other investors make informed decisions.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Squirell Team
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2024 Squirell. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  reviewRejected: (data) => ({
    subject: "Review Update - Squirell",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Squirell</h1>
          <p style="color: white; margin: 10px 0 0 0;">Fractional Investment Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Review Status Update</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${data.name},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We've reviewed your submission "${data.reviewTitle}" and unfortunately, it doesn't meet our community guidelines at this time.
          </p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #333; margin-top: 0;">Reason:</h3>
            <p style="color: #666; margin: 5px 0;">${data.reason}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You can submit a new review that addresses these concerns. We appreciate your understanding and continued participation in our community.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Squirell Team
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2024 Squirell. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),
};

// Send email function
export const sendEmail = async ({ email, subject, template, data }) => {
  try {
    const transporter = createTransporter();

    if (!emailTemplates[template]) {
      throw new Error(`Email template '${template}' not found`);
    }

    const emailContent = emailTemplates[template](data);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

// Legacy functions for backward compatibility
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  return sendEmail({
    email,
    subject: "Verify Your Email - Squirell",
    template: "emailVerification",
    data: { verificationUrl },
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  return sendEmail({
    email,
    subject: "Reset Your Password - Squirell",
    template: "passwordReset",
    data: { resetUrl },
  });
};

export const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    email,
    subject: "Welcome to Squirell!",
    template: "welcome",
    data: { name },
  });
};

export const sendReviewApprovedEmail = async (
  email,
  name,
  reviewTitle,
  rating
) => {
  return sendEmail({
    email,
    subject: "Your Review Has Been Approved - Squirell",
    template: "reviewApproved",
    data: { name, reviewTitle, rating },
  });
};

export const sendReviewRejectedEmail = async (
  email,
  name,
  reviewTitle,
  reason
) => {
  return sendEmail({
    email,
    subject: "Review Update - Squirell",
    template: "reviewRejected",
    data: { name, reviewTitle, reason },
  });
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendReviewApprovedEmail,
  sendReviewRejectedEmail,
};
