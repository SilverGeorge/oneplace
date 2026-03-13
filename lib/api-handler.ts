import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { ApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function createApiHandler(
  methods: Method[],
  handler: NextApiHandler
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const start = Date.now();

    if (!methods.includes(req.method as Method)) {
      res.setHeader("Allow", methods);
      res.status(405).json({
        success: false,
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "Method Not Allowed"
        }
      });
      return;
    }

    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof ApiError) {
        logger.warn("API error", {
          route: req.url,
          method: req.method,
          code: error.code,
          statusCode: error.statusCode
        });

        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        });
        return;
      }

      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request payload",
            details: error.flatten()
          }
        });
        return;
      }

      logger.error("Unhandled API error", {
        route: req.url,
        method: req.method,
        error: error instanceof Error ? error.message : "Unknown error"
      });

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong"
        }
      });
    } finally {
      logger.info("API request completed", {
        route: req.url,
        method: req.method,
        statusCode: res.statusCode,
        durationMs: Date.now() - start
      });
    }
  };
}
