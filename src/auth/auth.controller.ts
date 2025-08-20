import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  Session,
} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  login(
    @Query('scopes') scopes: string = 'user:read',
    @Res() res: express.Response,
    @Session() session: any,
  ) {
    try {
      const { url, state, codeVerifier } =
        this.authService.generateAuthUrl(scopes);
      console.log('Generated auth URL:', url);

      if (!session) {
        console.error('Session middleware not initialized');
        return res.status(500).send('Session middleware not initialized');
      }

      // Salva state e codeVerifier na sessão
      session.oauthState = state;
      session.codeVerifier = codeVerifier;

      return res.redirect(url);
    } catch (error) {
      console.error('Error in login route:', error);
      return res.status(500).send(`Error during login: ${error.message}`);
    }
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Session() session: any,
    @Res() res: express.Response,
  ) {
    console.log('Callback route accessed with:', {
      code: !!code,
      state,
      error,
    });
    console.log('Session data in callback:', session);

    if (error) {
      return res.redirect(`/callback.html?error=${encodeURIComponent(error)}`);
    }

    if (!code || !state || state !== session.oauthState) {
      return res.redirect('/callback.html?error=invalid_state');
    }

    try {
      console.log(
        'Exchanging code for token with verifier:',
        !!session.codeVerifier,
      );
      const tokenData = await this.authService.exchangeCodeForToken(
        code,
        session.codeVerifier,
      );

      // Limpa dados da sessão
      delete session.oauthState;
      delete session.codeVerifier;

      // Redireciona para callback.html com os tokens
      const params = new URLSearchParams({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || '',
        expires_in: tokenData.expires_in?.toString() || '',
        scope: tokenData.scope || '',
        token_type: tokenData.token_type || 'Bearer',
      });

      res.redirect(`/callback.html?${params.toString()}`);
    } catch (error) {
      console.log('Error during token exchange:', error);

      res.redirect(`/callback.html?error=${encodeURIComponent(error.message)}`);
    }
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new Error('Missing refresh_token');
    }

    return await this.authService.refreshToken(refreshToken);
  }
}
