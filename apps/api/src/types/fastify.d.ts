import "fastify";
import type { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
    githubOAuth2: OAuth2Namespace;
    facebookOAuth2: OAuth2Namespace;
  }
}
