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
exports.sendMailApproval = void 0;
exports.generateCMP_ID = generateCMP_ID;
const client_ses_1 = require("@aws-sdk/client-ses");
const awsSesConfig_1 = __importDefault(require("../config/awsSesConfig"));
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
function generateCMP_ID() {
    const tagNumber = `CMP-${Math.floor(100000 + Math.random() * 900000)}`;
    return tagNumber;
}
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
