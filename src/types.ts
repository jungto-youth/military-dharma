export type Bindings = {
  DB: D1Database;
  ASSETS: Fetcher;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  SESSION_SECRET?: string;
  ALLOWED_EMAILS?: string;
  ALLOW_DEV_LOGIN?: string;
};

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: {
    user: SessionUser;
    isAdmin: boolean;
  };
};
