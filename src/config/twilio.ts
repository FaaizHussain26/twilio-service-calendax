import twilio from "twilio";
import { variables } from "../constants/variables";

export const twilioClient = twilio(
  variables.TWILIO_ACCOUNT_SID,
  variables.TWILIO_AUTH_TOKEN
);

export const twilioPhoneNumber = variables.TWILIO_PHONE_NUMBER;

