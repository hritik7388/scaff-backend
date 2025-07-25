import {SendEmailCommand} from "@aws-sdk/client-ses";;
const fs = require("fs"); 
import Configs from "../config/awsSesConfig"; 
import admin from "firebase-admin";
import firebaseAdminConfig from "../config/firebaseAdminConfig"; // ✅ NEW

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig as admin.ServiceAccount),
  });
}

export const sendMailApproval = async (toEmail: string, password: string): Promise<string> => {
    const fromEmail = process.env.EMAIL_FROM;
    if (!fromEmail) throw new Error("EMAIL_FROM is not defined in environment variables");

    const subject = "Your Company Registration Approved";
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
                    Charset: "UTF-8",
                    Data: bodyHtml,
                },
            },
            Subject: {
                Charset: "UTF-8",
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
 

export const pushNotificationDelhi=async (deviceToken: any, title: any, body: any) => {
    const message = {
      token: deviceToken,
      notification: {
        title,
        body,
      },
      data: {
        title,
        body,
      },
    };

    try {
      console.log("Push Notification - Message:", message);
      const response = await admin.messaging().send(message);
      console.log("✅ FCM Response:", response);
      return response;
    } catch (error) {
      console.error("❌ FCM Error:", error);
      throw error;
    }
}

 