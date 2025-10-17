import { type Response } from "express";
import type { CustomResponse } from "./types/others.js";

const sendError = (res: Response, message: string, status: number = 400) => {
    res.status(status).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #242424;
            color: #ff0000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .error-box {
            background-color: #000000;
            padding: 20px 30px;
            border-radius: 5px;
            text-align: center;
            box-shadow: 0 2px 8px #000000;
          }
          h1 {
            margin: 0 0 10px 0;
          }
          p {
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="error-box">
          <h1>Error</h1>
          <p>${message}</p>
        </div>
      </body>
      </html>
    `);
};


const customResponse = ({message, status, data}: { message?: string; status?: number; data?: any }): CustomResponse => ({
  message, status, data
});



declare module "express-session" {
  interface SessionData {
      user_id?: string;
  }
}
export { sendError, customResponse };