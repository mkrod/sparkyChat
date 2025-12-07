import type { Request, Response } from "express";
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const bypassMediaWithCors = async (req: Request, res: Response) => {
  try {
    const imageUrl = req.query.url as string;
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      httpsAgent
    });

    res.set("Content-Type", response.headers["content-type"] || "image/jpeg");
    res.send(Buffer.from(response.data));
  } catch (err) {
    //console.log("Cannot Bypass Link:", err);
    res.send(req.query.url);
  }
};
