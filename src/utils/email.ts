import nodemailer from 'nodemailer';

// You would typically use a service like SendGrid, NodeMailer, or AWS SES
// This is a mock implementation for demonstration purposes

export const sendResetPasswordEmail = async (email: string, resetLink: string) => {
    try {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'techexamjes@gmail.com',
                pass: 'sjjb fwlj aaik usar',
            },
        });

        const mailOptions = {
            from: '"Tech Exam" <noreply@tech-exam.com>',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <p><a href="${resetLink}">${resetLink}</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        };
        console.log(resetLink)
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending reset password email:', error);
        throw new Error('Failed to send reset password email');
    }
}; 