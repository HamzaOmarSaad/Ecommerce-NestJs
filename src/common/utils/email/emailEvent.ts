// Services/email.events.ts

import EventEmitter from "events";
import { EventHandler } from "../Events/EventHandler";
import { sendEmailService } from "./sendEmail";

const EmailEmitter = new EventEmitter();

export const emailEvent = new EventHandler(EmailEmitter);

emailEvent.subscribe("confirm-Email", async (payload) => {
  await sendEmailService(payload);
});

emailEvent.subscribe("forgetPassword", async (payload) => {
  await sendEmailService(payload);
});
