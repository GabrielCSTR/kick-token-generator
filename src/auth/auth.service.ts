import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly kickAuthUrl = 'https://id.kick.com/oauth/authorize';
  private readonly kickTokenUrl = 'https://id.kick.com/oauth/token';
  private readonly redirectUri = process.env.KICK_REDIRECT_URI;


  generateAuthUrl(
    scopes: string,
    customClientId?: string,
  ): {
    url: string;
    state: string;
    codeVerifier: string;
  } {
    const state = this.base64url(randomBytes(16));
    const codeVerifier = this.base64url(randomBytes(32));
    const codeChallenge = this.base64url(
      createHash('sha256').update(codeVerifier).digest(),
    );

    const clientId = customClientId;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId ?? '',
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

  async exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    customClientId?: string,
    customClientSecret?: string,
  ) {
    const clientId = customClientId;
    const clientSecret = customClientSecret;

    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code ?? '',
      redirect_uri: this.redirectUri ?? '',
      client_id: clientId ?? '',
      client_secret: clientSecret ?? '',
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

  async refreshToken(
    refreshToken: string,
    customClientId?: string,
    customClientSecret?: string,
  ) {
    const clientId = customClientId;
    const clientSecret = customClientSecret;

    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken ?? '',
      client_id: clientId ?? '',
      client_secret: clientSecret ?? '',
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
