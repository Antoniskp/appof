import crypto from "node:crypto";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import oauth2 from "@fastify/oauth2";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const app = Fastify({ logger: true });
const prisma = new PrismaClient();

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
const webBaseUrl = process.env.WEB_BASE_URL ?? "http://localhost:3000";
const jwtSecret = process.env.JWT_SECRET ?? "dev-secret";
const accessTokenTtlMinutes = Number(
  process.env.ACCESS_TOKEN_TTL_MINUTES ?? 15
);
const refreshTokenTtlDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 14);
const isSecureCookie = process.env.NODE_ENV === "production";

const refreshCookieName = "refreshToken";

app.register(cors, {
  origin: [webBaseUrl],
  credentials: true,
});
app.register(cookie, {
  secret: process.env.COOKIE_SECRET ?? "cookie-secret",
  hook: "onRequest",
});

function createAccessToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: `${accessTokenTtlMinutes}m` }
  );
}

function createRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueRefreshSession(userId: string) {
  const token = createRefreshToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + refreshTokenTtlDays);

  await prisma.refreshSession.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

function setRefreshCookie(
  reply: FastifyReply,
  token: string,
  expiresAt: Date
) {
  reply.setCookie(refreshCookieName, token, {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

async function revokeSession(token: string) {
  const tokenHash = hashToken(token);
  await prisma.refreshSession.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function getUserFromToken(authHeader?: string) {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  try {
    const payload = jwt.verify(token, jwtSecret) as {
      sub: string;
      email: string;
      role: string;
    };
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

app.get("/health", async () => {
  return { status: "ok" };
});

app.post("/auth/register", async (request, reply) => {
  const body = request.body as { email: string; password: string; name?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email || !body.password) {
    return reply.status(400).send({ error: "Email και κωδικός απαιτούνται." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return reply.status(409).send({ error: "Το email χρησιμοποιείται ήδη." });
  }

  const passwordHash = await argon2.hash(body.password);
  const user = await prisma.user.create({
    data: {
      email,
      name: body.name?.trim() || null,
      passwordHash,
    },
  });

  const accessToken = createAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  const session = await issueRefreshSession(user.id);
  setRefreshCookie(reply, session.token, session.expiresAt);

  return reply.send({
    accessToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

app.post("/auth/login", async (request, reply) => {
  const body = request.body as { email: string; password: string };
  const email = body.email?.trim().toLowerCase();
  if (!email || !body.password) {
    return reply.status(400).send({ error: "Email και κωδικός απαιτούνται." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return reply.status(401).send({ error: "Λάθος στοιχεία εισόδου." });
  }

  const valid = await argon2.verify(user.passwordHash, body.password);
  if (!valid) {
    return reply.status(401).send({ error: "Λάθος στοιχεία εισόδου." });
  }

  const accessToken = createAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  const session = await issueRefreshSession(user.id);
  setRefreshCookie(reply, session.token, session.expiresAt);

  return reply.send({
    accessToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

app.post("/auth/refresh", async (request, reply) => {
  const token = request.cookies[refreshCookieName];
  if (!token) {
    return reply.status(401).send({ error: "Δεν υπάρχει ενεργή συνεδρία." });
  }

  const tokenHash = hashToken(token);
  const session = await prisma.refreshSession.findFirst({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  if (!session) {
    return reply.status(401).send({ error: "Η συνεδρία έληξε." });
  }

  await revokeSession(token);
  const newSession = await issueRefreshSession(session.userId);
  setRefreshCookie(reply, newSession.token, newSession.expiresAt);

  const accessToken = createAccessToken({
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  });

  return reply.send({
    accessToken,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    },
  });
});

app.post("/auth/logout", async (request, reply) => {
  const token = request.cookies[refreshCookieName];
  if (token) {
    await revokeSession(token);
  }
  reply.clearCookie(refreshCookieName, { path: "/" });
  return reply.send({ status: "ok" });
});

app.get("/me", async (request, reply) => {
  const userToken = await getUserFromToken(request.headers.authorization);
  if (!userToken) {
    return reply.status(401).send({ error: "Μη έγκυρο token." });
  }

  const user = await prisma.user.findUnique({
    where: { id: userToken.id },
    include: { oauthAccounts: true },
  });
  if (!user) {
    return reply.status(404).send({ error: "Ο χρήστης δεν βρέθηκε." });
  }

  return reply.send({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    providers: user.oauthAccounts.map((account) => account.provider),
  });
});

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  app.register(oauth2, {
    name: "googleOAuth2",
    scope: ["profile", "email"],
    credentials: {
      client: {
        id: googleClientId,
        secret: googleClientSecret,
      },
      auth: {
        authorizeHost: "https://accounts.google.com",
        authorizePath: "/o/oauth2/v2/auth",
        tokenHost: "https://oauth2.googleapis.com",
        tokenPath: "/token",
      },
    },
    startRedirectPath: "/auth/oauth/google",
    callbackUri: `${apiBaseUrl}/auth/oauth/google/callback`,
  });
} else {
  app.log.warn("Google OAuth credentials not configured.");
}

if (githubClientId && githubClientSecret) {
  app.register(oauth2, {
    name: "githubOAuth2",
    scope: ["user:email"],
    credentials: {
      client: {
        id: githubClientId,
        secret: githubClientSecret,
      },
      auth: {
        authorizeHost: "https://github.com",
        authorizePath: "/login/oauth/authorize",
        tokenHost: "https://github.com",
        tokenPath: "/login/oauth/access_token",
      },
    },
    startRedirectPath: "/auth/oauth/github",
    callbackUri: `${apiBaseUrl}/auth/oauth/github/callback`,
  });
} else {
  app.log.warn("GitHub OAuth credentials not configured.");
}

if (facebookClientId && facebookClientSecret) {
  app.register(oauth2, {
    name: "facebookOAuth2",
    scope: ["email"],
    credentials: {
      client: {
        id: facebookClientId,
        secret: facebookClientSecret,
      },
      auth: {
        authorizeHost: "https://www.facebook.com",
        authorizePath: "/v18.0/dialog/oauth",
        tokenHost: "https://graph.facebook.com",
        tokenPath: "/v18.0/oauth/access_token",
      },
    },
    startRedirectPath: "/auth/oauth/facebook",
    callbackUri: `${apiBaseUrl}/auth/oauth/facebook/callback`,
  });
} else {
  app.log.warn("Facebook OAuth credentials not configured.");
}

async function handleOAuth(
  provider: "google" | "github" | "facebook",
  request: FastifyRequest,
  reply: FastifyReply
) {
  let oauthClient;
  if (provider === "google") oauthClient = app.googleOAuth2;
  if (provider === "github") oauthClient = app.githubOAuth2;
  if (provider === "facebook") oauthClient = app.facebookOAuth2;

  if (!oauthClient) {
    return reply
      .status(501)
      .send({ error: "Ο πάροχος OAuth δεν έχει ρυθμιστεί." });
  }

  const token = await oauthClient.getAccessTokenFromAuthorizationCodeFlow(
    request
  );

  const accessToken = token.token.access_token as string;
  let profile: { email?: string; name?: string; id?: string } = {};

  if (provider === "google") {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = (await response.json()) as { email?: string; name?: string; id?: string };
    profile = { email: data.email, name: data.name, id: data.id };
  }

  if (provider === "github") {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });
    const userData = (await response.json()) as { id?: number; name?: string; login?: string };
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });
    const emails = (await emailResponse.json()) as Array<{ email: string; primary: boolean }>;
    const primaryEmail = emails.find((item) => item.primary)?.email;
    profile = {
      email: primaryEmail,
      name: userData.name ?? userData.login,
      id: userData.id?.toString(),
    };
  }

  if (provider === "facebook") {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );
    const data = (await response.json()) as { id?: string; name?: string; email?: string };
    profile = { email: data.email, name: data.name, id: data.id };
  }

  if (!profile.email || !profile.id) {
    return reply
      .status(400)
      .send({ error: "Απαιτείται email από τον πάροχο OAuth." });
  }

  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId: profile.id,
      },
    },
    include: { user: true },
  });

  let user = existingAccount?.user ?? undefined;
  if (!user) {
    user = await prisma.user.findUnique({ where: { email: profile.email } }) ?? undefined;
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name ?? null,
      },
    });
  }

  if (existingAccount) {
    await prisma.oAuthAccount.update({
      where: { id: existingAccount.id },
      data: {
        accessToken,
        providerAccountId: profile.id,
        userId: user.id,
      },
    });
  } else {
    await prisma.oAuthAccount.create({
      data: {
        provider,
        providerAccountId: profile.id,
        accessToken,
        userId: user.id,
      },
    });
  }

  const session = await issueRefreshSession(user.id);
  setRefreshCookie(reply, session.token, session.expiresAt);

  return reply.redirect(`${webBaseUrl}/auth/complete`);
}

app.get("/auth/oauth/google/callback", async (request, reply) => {
  return handleOAuth("google", request, reply);
});

app.get("/auth/oauth/github/callback", async (request, reply) => {
  return handleOAuth("github", request, reply);
});

app.get("/auth/oauth/facebook/callback", async (request, reply) => {
  return handleOAuth("facebook", request, reply);
});

const port = Number(process.env.API_PORT ?? 4000);
const host = process.env.API_HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
