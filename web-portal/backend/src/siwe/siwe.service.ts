import { Injectable } from '@nestjs/common';

@Injectable()
export class SiweService {
  async getSession(sessionCookie: string) {
    // TODO
  }

  async verifyMessage({
    message,
    signature,
  }: {
    message: string;
    signature: string;
  }) {
    // TODO
  }

  async getNonce(sessionCookie: string) {
    // TODO
  }

  async signOut() {
    // TODO
  }
}
