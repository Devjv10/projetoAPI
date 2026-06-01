import { Request, Response } from "express";
import { getVersionInfo } from "../infrastructure/config/versionConfig";

export const getVersion = (_req: Request, res: Response): void => {
  res.status(200).json(getVersionInfo());
};
