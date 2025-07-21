 
import { SendEmailCommand } from "@aws-sdk/client-ses";
// Adjust the import according to the actual export from awsSesConfig
import Configs from "../config/awsSesConfig";

   export function generateCMP_ID() {
        const tagNumber = `CMP-${Math.floor(100000 + Math.random() * 900000)}`;
        return tagNumber;
    }


export const sendMailApproval = async (toEmail: string, password: string): Promise<string> => {
  const fromEmail = process.env.EMAIL_FROM;
  if (!fromEmail) throw new Error("EMAIL_FROM is not defined in environment variables");

  const subject = 'Your Company Registration Approved';
  const bodyHtml = `
    <html>
      <body>
        <h2>Company Registration Approved</h2>
        <p>Congratulations! Your company registration has been approved by the super admin.</p>
        <p><strong>Email:</strong> ${toEmail}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>You can now log in to the system and start using the platform.</p>
      </body>
    </html>
  `;

  const params = {
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: bodyHtml,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: fromEmail,
  };

  try {
    const command = new SendEmailCommand(params);
    await Configs.send(command);
    return `Email sent to ${toEmail}`;
  } catch (err) {
    console.error("Error sending approval email:", err);
    throw new Error("Failed to send approval email");
  }
};

