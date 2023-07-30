import { Request, Response } from "express";

export const getExample = (req: Request, res: Response) => {
  // add logic here
  res.send("Example");
};
