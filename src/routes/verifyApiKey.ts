import { Request, Response, NextFunction } from "express"

export function verifyApiKey(req: Request, res: Response, next: NextFunction) {

    const apiKey = req.headers["x-api-key"]

    if (apiKey !== process.env.API_SECRET) {

        return res.status(401).json({
            error: "Unauthorized"
        })
    }

    next()
}