import { All, Controller, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";

const AUTH_SERVICE_URL = () =>
  process.env.AUTH_SERVICE_URL ?? "http://localhost:3001";
const GOALS_SERVICE_URL = () =>
  process.env.GOALS_SERVICE_URL ?? "http://localhost:3002";
const ANALYTICS_SERVICE_URL = () =>
  process.env.ANALYTICS_SERVICE_URL ?? "http://localhost:3004";

@Controller()
export class ProxyController {
  @All(["auth", "auth/{*path}"])
  proxyAuth(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, AUTH_SERVICE_URL());
  }

  @All(["goals", "goals/{*path}"])
  proxyGoals(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, GOALS_SERVICE_URL());
  }

  @All(["analytics", "analytics/{*path}"])
  proxyAnalytics(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, ANALYTICS_SERVICE_URL());
  }

  private async forward(req: Request, res: Response, baseUrl: string) {
    const url = `${baseUrl.replace(/\/$/, "")}${req.originalUrl}`;
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (typeof req.headers.authorization === "string") {
      headers.authorization = req.headers.authorization;
    }

    const init: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = JSON.stringify(req.body ?? {});
    }

    try {
      const upstream = await fetch(url, init);
      const contentType = upstream.headers.get("content-type") ?? "";
      const body = contentType.includes("application/json")
        ? await upstream.json()
        : await upstream.text();
      res.status(upstream.status).send(body);
    } catch {
      res.status(502).json({ message: "Bad gateway" });
    }
  }
}
