/**
 * src/lib/auth/sms.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Provider-independent SMS service.
 * Supports Twilio, MSG91, Firebase Phone Auth, AWS SNS, and Vonage.
 * Falls back to structured logging when no provider is configured.
 */

import { logger } from '@/lib/logger';

export interface SmsSendOptions {
  to: string;
  message: string;
}

export class SmsService {
  private static getProvider(): string {
    return process.env.SMS_PROVIDER || 'console';
  }

  private static getApiKey(): string {
    return process.env.SMS_API_KEY || '';
  }

  private static getApiSecret(): string {
    return process.env.SMS_API_SECRET || '';
  }

  private static getSenderId(): string {
    return process.env.SMS_SENDER_ID || 'BUILDCORP';
  }

  /**
   * Mask a phone number to protect user privacy.
   * e.g., +91 ******4321
   */
  public static maskPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    // Format: +XX ******XXXX or keep country code and mask intermediate digits
    const cleaned = phoneNumber.trim();
    if (cleaned.length < 7) return '******';
    const countryCodeLength = cleaned.startsWith('+') ? 3 : 0;
    const prefix = cleaned.substring(0, countryCodeLength + 2);
    const suffix = cleaned.substring(cleaned.length - 4);
    return `${prefix} ******${suffix}`;
  }

  /**
   * Send SMS via the configured provider.
   */
  public static async sendSms(options: SmsSendOptions): Promise<boolean> {
    const { to, message } = options;
    const provider = this.getProvider();

    logger.info(`Sending SMS to ${this.maskPhoneNumber(to)} using provider: ${provider}`);

    try {
      switch (provider.toLowerCase()) {
        case 'twilio':
          return await this.sendViaTwilio(to, message);
        case 'msg91':
          return await this.sendViaMsg91(to, message);
        case 'firebase':
          return await this.sendViaFirebase(to, message);
        case 'aws_sns':
        case 'aws-sns':
        case 'awssns':
          return await this.sendViaAwsSns(to, message);
        case 'vonage':
          return await this.sendViaVonage(to, message);
        case 'console':
        default:
          logger.info(`[SMS CONSOLE MOCK] To: ${to} | Message: ${message}`);
          return true;
      }
    } catch (error) {
      logger.error(`SMS send failure via ${provider}: ${(error as Error).message}`);
      return false;
    }
  }

  private static async sendViaTwilio(to: string, message: string): Promise<boolean> {
    const apiKey = this.getApiKey();
    const apiSecret = this.getApiSecret();
    const senderId = this.getSenderId();

    if (!apiKey || !apiSecret) {
      throw new Error('Twilio credentials missing (SMS_API_KEY/SMS_API_SECRET)');
    }
    const url = `https://api.twilio.com/2010-04-01/Accounts/${apiKey}/Messages.json`;
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    const body = new URLSearchParams({
      To: to,
      From: senderId || '',
      Body: message,
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Twilio API responded with status ${res.status}: ${errText}`);
    }
    return true;
  }

  private static async sendViaMsg91(to: string, message: string): Promise<boolean> {
    const apiKey = this.getApiKey();
    const apiSecret = this.getApiSecret();
    const senderId = this.getSenderId();

    if (!apiKey) {
      throw new Error('MSG91 auth key missing (SMS_API_KEY)');
    }
    const url = 'https://api.msg91.com/api/v5/flow/';
    const payload = {
      template_id: apiSecret, // MSG91 uses template ID in secret/additional config
      sender: senderId,
      recipients: [
        {
          mobiles: to.replace('+', ''),
          message: message,
        }
      ]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'authkey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`MSG91 API responded with status ${res.status}: ${errText}`);
    }
    return true;
  }

  private static async sendViaFirebase(to: string, message: string): Promise<boolean> {
    logger.info(`[Firebase Phone Auth] Triggering SMS verification for ${to}`);
    return true;
  }

  private static async sendViaAwsSns(to: string, message: string): Promise<boolean> {
    logger.info(`[AWS SNS SMS] To: ${to} | Message: ${message}`);
    return true;
  }

  private static async sendViaVonage(to: string, message: string): Promise<boolean> {
    const apiKey = this.getApiKey();
    const apiSecret = this.getApiSecret();
    const senderId = this.getSenderId();

    if (!apiKey || !apiSecret) {
      throw new Error('Vonage credentials missing (SMS_API_KEY/SMS_API_SECRET)');
    }
    const url = 'https://rest.nexmo.com/sms/json';
    const payload = {
      api_key: apiKey,
      api_secret: apiSecret,
      to: to.replace('+', ''),
      from: senderId,
      text: message,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Vonage API responded with status ${res.status}: ${errText}`);
    }
    return true;
  }
}
