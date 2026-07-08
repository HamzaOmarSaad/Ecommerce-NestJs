import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { EmailEvents } from './email.event';

@Injectable()
export class EmailListener {
  constructor(private readonly emailService: EmailService) {}

  @OnEvent(EmailEvents.CONFIRM_EMAIL)
  async handleConfirmEmail(payload: {
    to: string;
    subject: string;
    html: string;
  }) {
    await this.emailService.sendEmailService(payload);
  }

  @OnEvent(EmailEvents.FORGET_PASSWORD)
  async handleForgetPassword(payload: {
    to: string;
    subject: string;
    html: string;
  }) {
    await this.emailService.sendEmailService(payload);
  }
}
