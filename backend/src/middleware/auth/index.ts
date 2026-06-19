import { Response, NextFunction } from "express";
import { jwtAuth } from "./jwt.middleware";
import { oauthAuth } from "./oauth.middleware";
import { AuthRequest } from "../../types/auth.types";

/**
 * Composed authentication middleware that routes to standard JWT or OAuth verification.
 */
export const apiGatewayAuth = (requiredScopes: string[] = []) => {
  const jwtMiddleware = jwtAuth(requiredScopes);
  const oauthMiddleware = oauthAuth(requiredScopes);

  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.headers["x-oauth-provider"]) {
      oauthMiddleware(req, res, next);
    } else {
      jwtMiddleware(req, res, next);
    }
  };
};

export { appCheck } from "./appcheck.middleware";
