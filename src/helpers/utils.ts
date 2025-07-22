import {SendEmailCommand} from "@aws-sdk/client-ses";

import Configs from "../config/awsSesConfig";
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/svg+xml",
    "image/gif",
];
const allowedDocumentTypes = [
    "application/pdf",
    "image/jpg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

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

export const generatePresignedUrl = async (filename: string, contentType: string) => {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/\s+/g, "_");

    let folder = "";

    if (allowedImageTypes.includes(contentType)) {
        folder = "profile_image";
    } else if (allowedDocumentTypes.includes(contentType)) {
        folder = "user_verification_docs";
    } else {
        throw new Error("Unsupported file type");
    }

    const key = `users/${folder}/${timestamp}-${sanitizedFilename}`;

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET!,
        Key: key,
        ContentType: contentType,
    });

    try {
        const url = await getSignedUrl(s3Client, putObjectCommand, {
            expiresIn: 3600,
        });

        return {
            url,
            key,
        };
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        throw new Error("Failed to generate upload URL");
    }
};

export const generateReadUrl = async (key: string): Promise<string> => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET!,
            Key: key,
        });
        const url = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
        });
        return url;
    } catch (error) {
        console.error("Error generating read URL:", error);
        throw new Error("Failed to generateReadUrl");
    }
};
