"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReadUrl = exports.generatePresignedUrl = exports.sendMailApproval = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const awsSesConfig_1 = __importDefault(require("../config/awsSesConfig"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/svg+xml",
    "image/gif"
];
const allowedDocumentTypes = [
    "application/pdf",
    "image/jpg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const sendMailApproval = (toEmail, password) => __awaiter(void 0, void 0, void 0, function* () {
    const fromEmail = process.env.EMAIL_FROM;
    if (!fromEmail)
        throw new Error("EMAIL_FROM is not defined in environment variables");
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
        const command = new client_ses_1.SendEmailCommand(params);
        yield awsSesConfig_1.default.send(command);
        return `Email sent to ${toEmail}`;
    }
    catch (err) {
        console.error("Error sending approval email:", err);
        throw new Error("Failed to send approval email");
    }
});
exports.sendMailApproval = sendMailApproval;
const generatePresignedUrl = (filename, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/\s+/g, "_");
    let folder = "";
    if (allowedImageTypes.includes(contentType)) {
        folder = "profile_image";
    }
    else if (allowedDocumentTypes.includes(contentType)) {
        folder = "user_verification_docs";
    }
    else {
        throw new Error("Unsupported file type");
    }
    const key = `users/${folder}/${timestamp}-${sanitizedFilename}`;
    const putObjectCommand = new client_s3_1.PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        ContentType: contentType,
    });
    try {
        const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, putObjectCommand, {
            expiresIn: 3600,
        });
        return {
            url,
            key,
        };
    }
    catch (error) {
        console.error("Error generating presigned URL:", error);
        throw new Error("Failed to generate upload URL");
    }
});
exports.generatePresignedUrl = generatePresignedUrl;
const generateReadUrl = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: key,
        });
        const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, {
            expiresIn: 3600
        });
        return url;
    }
    catch (error) {
        console.error('Error generating read URL:', error);
        throw new Error('Failed to generateReadUrl');
    }
});
exports.generateReadUrl = generateReadUrl;
