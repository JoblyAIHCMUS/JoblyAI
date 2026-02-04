import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
	private buildAuthUrl(params: Record<string, string>): string {
		const baseEndpoint =
			process.env.LOGTO_PUBLIC_ENDPOINT ||
			process.env.LOGTO_ENDPOINT ||
			'http://localhost:3001';
		const normalizedEndpoint = baseEndpoint.replace(/\/+$/, '');
		const url = new URL(`${normalizedEndpoint}/oidc/auth`);

		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.set(key, value);
		});

		return url.toString();
	}

	getRegisterUrl(): string {
		return this.buildAuthUrl({
			client_id: process.env.LOGTO_CLIENT_ID || '',
			response_type: 'code',
			scope: 'openid profile email',
			interaction_mode: 'signUp',
			redirect_uri:
				process.env.LOGTO_REDIRECT_URI ||
				'http://localhost:3000/api/auth/callback/logto',
		});
	}

	getLoginUrl(): string {
		return this.buildAuthUrl({
			client_id: process.env.LOGTO_CLIENT_ID || '',
			response_type: 'code',
			scope: 'openid profile email',
			redirect_uri:
				process.env.LOGTO_REDIRECT_URI ||
				'http://localhost:3000/api/auth/callback/logto',
		});
	}
}
