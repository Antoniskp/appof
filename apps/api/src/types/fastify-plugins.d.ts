declare module "@fastify/cors";
declare module "@fastify/cookie";
declare module "@fastify/oauth2" {
  export type OAuth2Namespace = {
    getAccessTokenFromAuthorizationCodeFlow: (request: unknown) => Promise<{
      token: { access_token?: string };
    }>;
  };
  const plugin: unknown;
  export default plugin;
}
declare module "argon2" {
  export function hash(value: string): Promise<string>;
  export function verify(hash: string, value: string): Promise<boolean>;
}

declare module "fastify" {
  interface FastifyRequest {
    cookies: Record<string, string | undefined>;
  }

  interface FastifyReply {
    status: (code: number) => FastifyReply;
    setCookie: (
      name: string,
      value: string,
      options?: Record<string, unknown>
    ) => FastifyReply;
    clearCookie: (name: string, options?: Record<string, unknown>) => FastifyReply;
    redirect: (location: string) => FastifyReply;
  }
}
