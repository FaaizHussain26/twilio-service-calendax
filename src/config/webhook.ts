import dotenv from "dotenv";
dotenv.config();

const webhookUrl = process.env.N8N_WEBHOOK_URL as string || "";

if (!webhookUrl) {
    throw new Error("N8N_WEBHOOK_URL is not defined in the environment variables");
}


export { webhookUrl };