import { Request, Response } from "express";
import { Connection } from "typeorm";

export type MyContext = {
  req: Request & { session: any };
  res: Response;
  conn: Connection;
};
