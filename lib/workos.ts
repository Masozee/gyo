import { WorkOS } from '@workos-inc/node';

// Initialize WorkOS client
export const workos = new WorkOS(process.env.WORKOS_API_KEY);

export const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID;
export const WORKOS_REDIRECT_URI = process.env.WORKOS_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/workos`;

// OAuth provider configurations
export const OAUTH_PROVIDERS = {
  google: 'GoogleOAuth',
  microsoft: 'MicrosoftOAuth',
  github: 'GitHubOAuth',
  apple: 'AppleOAuth'
} as const;

export type OAuthProvider = keyof typeof OAUTH_PROVIDERS;

// Generate authorization URL for OAuth provider
export function getAuthorizationUrl(provider: OAuthProvider, state?: string) {
  if (!WORKOS_CLIENT_ID) {
    throw new Error('WORKOS_CLIENT_ID is not configured');
  }

  return workos.userManagement.getAuthorizationUrl({
    provider: OAUTH_PROVIDERS[provider],
    clientId: WORKOS_CLIENT_ID,
    redirectUri: WORKOS_REDIRECT_URI,
    state,
  });
}

// Authenticate with WorkOS code
export async function authenticateWithWorkOS(code: string) {
  if (!WORKOS_CLIENT_ID) {
    throw new Error('WORKOS_CLIENT_ID is not configured');
  }

  try {
    const result = await workos.userManagement.authenticateWithCode({
      code,
      clientId: WORKOS_CLIENT_ID,
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  } catch (error) {
    console.error('WorkOS authentication error:', error);
    throw error;
  }
}