import type { Request, Response, NextFunction } from "express";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export async function middleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization;

    // if (!authHeader?.startsWith("Bearer ")) {
    //   return res.json({
    //     message: "Missing Token",
    //   });
    // }

    // const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (!user || error) {
      return res.status(401).json({
        error: "Invalid Token",
      });
    }

    req.user = user;
    console.log(user);
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
