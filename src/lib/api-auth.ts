import { NextRequest } from "next/server";

/**
 * Checks if the request has a valid API key.
 * The key can be passed in the 'x-api-key' header or 'api_key' query parameter.
 */
export function isAuthenticated(req: NextRequest): boolean {
    const apiKey = req.headers.get("x-api-key") || req.nextUrl.searchParams.get("api_key");
    const secret = process.env.API_SECRET_KEY;

    if (!secret) {
        console.error("API_SECRET_KEY is not defined in environment variables.");
        return false;
    }

    return apiKey === secret;
}
