/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly kickAuthUrl = 'https://id.kick.com/oauth/authorize';
  private readonly kickTokenUrl = 'https://id.kick.com/oauth/token';

  private readonly clientId = process.env.KICK_CLIENT_ID;
  private readonly clientSecret = process.env.KICK_CLIENT_SECRET;
  private readonly redirectUri = process.env.KICK_REDIRECT_URI;

  generateAuthUrl(scopes: string): {
    url: string;
    state: string;
    codeVerifier: string;
  } {
    const state = this.base64url(randomBytes(16));
    const codeVerifier = this.base64url(randomBytes(32));
    const codeChallenge = this.base64url(
      createHash('sha256').update(codeVerifier).digest(),
    );

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId ?? '',
      redirect_uri: this.redirectUri ?? '',
      scope: scopes,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return {
      url: `${this.kickAuthUrl}?${params.toString()}`,
      state,
      codeVerifier,
    };
  }

  async exchangeCodeForToken(code: string, codeVerifier: string) {
    console.log('Exchange code for token:', {
      hasCode: !!code,
      hasVerifier: !!codeVerifier,
      redirectUri: this.redirectUri,
    });

    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code ?? '',
      redirect_uri: this.redirectUri ?? '',
      client_id: this.clientId ?? '',
      client_secret: this.clientSecret ?? '',
      code_verifier: codeVerifier ?? '',
    });

    try {
      console.log('Making token request to:', this.kickTokenUrl);
      console.log('Request data:', data.toString());

      const response = await axios.post(this.kickTokenUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Token response received:', {
        status: response.status,
        hasAccessToken: !!response.data?.access_token,
        hasRefreshToken: !!response.data?.refresh_token,
      });

      return response.data;
    } catch (error) {
      console.error(
        'Token exchange error:',
        error.response?.data || error.message,
      );
      throw new Error(`Token exchange failed: ${error.message}`);
    }
  }

  async refreshToken(refreshToken: string) {
    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken ?? '',
      client_id: this.clientId ?? '',
      client_secret: this.clientSecret ?? '',
    });

    try {
      const response = await axios.post(this.kickTokenUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(
        `Token refresh failed: ${error.response?.data || error.message}`,
      );
    }
  }

  private base64url(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}
