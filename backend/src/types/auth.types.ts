import { Request } from "express";
import * as core from "express-serve-static-core";
import * as qs from "qs";

/**
 * Custom and standard claims extracted from decoded Firebase ID Token.
 */
export interface UserClaims {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  firebase: {
    sign_in_provider: string;
    [key: string]: unknown;
  };
  scopes?: string[];
  [key: string]: unknown;
}

/**
 * Cleaned and standardized user payload attached to request context.
 */
export interface AuthPayload {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  scopes: string[];
  providerId: string;
}

/**
 * Custom Express Request generic interface that attaches `user` property.
 */
export interface AuthRequest<
  Params = core.ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = qs.ParsedQs,
  Locals extends Record<string, unknown> = Record<string, unknown>,
> extends Request<Params, ResBody, ReqBody, ReqQuery, Locals> {
  user?: AuthPayload;
}
