import dotenv from "dotenv";

dotenv.config();

const PORT = (process.env.PORT as string) || 5001;
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION as string;
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET as string;
const JWT_RESET_EXPIRATION = process.env.JWT_RESET_EXPIRATION as string;
const JWT_VERIFY_SECRET = process.env.JWT_VERIFY_SECRET as string;
const JWT_VERIFY_EXPIRATION = process.env.JWT_VERIFY_EXPIRATION as string;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
const MONGO_URI = process.env.MONGO_URI as string;
const MONGO_DATABASE_NAME = process.env.MONGO_DATABASE_NAME as string;
const PG_HOST = process.env.PG_HOST as string;
const PG_PORT = process.env.PG_PORT as string;
const PG_DATABASE = process.env.PG_DATABASE as string;
const PG_USER = process.env.PG_USER as string;
const PG_PASSWORD = process.env.PG_PASSWORD as string;
const PG_SSL = process.env.PG_SSL as string;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || (" " as string);
const VALID_API_KEYS = process.env.VALID_API_KEYS;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID as string;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN as string;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER as string;
export const variables = {
  PORT,
  JWT_SECRET,
  JWT_EXPIRATION,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRATION,
  JWT_RESET_SECRET,
  JWT_RESET_EXPIRATION,
  JWT_VERIFY_SECRET,
  JWT_VERIFY_EXPIRATION,
  OPENAI_API_KEY,
  MONGO_URI,
  MONGO_DATABASE_NAME,
  PG_HOST,
  PG_PORT,
  PG_DATABASE,
  PG_USER,
  PG_PASSWORD,
  PG_SSL,
  ENCRYPTION_KEY,
  VALID_API_KEYS,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER
};
