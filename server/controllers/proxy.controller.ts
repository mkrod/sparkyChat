import type { Request, Response } from "express";



export const bypassMediaWithCors = async (req: Request, res: Response) => {
    const imageUrl = req.query.url as string;
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    res.set("Content-Type", response.headers.get("content-type") || "image/jpeg");
    res.send(Buffer.from(buffer));
}