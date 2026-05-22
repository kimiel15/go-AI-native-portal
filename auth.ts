import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET!,
      // When AUTH_MICROSOFT_ENTRA_ID_TENANT_ID is set, scope login to
      // Trend Micro's directory (better UX — shows corporate login).
      // When unset, falls back to the 'common' endpoint; the signIn
      // callback below still hard-gates to @trendmicro.com emails.
      ...(process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID && {
        issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
      }),
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Hard gate: only @trendmicro.com addresses may proceed.
      return user.email?.toLowerCase().endsWith('@trendmicro.com') ?? false;
    },
  },
  pages: {
    signIn: '/signin',
    error:  '/signin',
  },
});
