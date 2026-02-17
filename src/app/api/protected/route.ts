
import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/api-auth";

// Example of a protected GET request
export async function GET(req: NextRequest) {
    if (!isAuthenticated(req)) {
        return NextResponse.json(
            { error: "Unauthorized access", message: "Missing or invalid API key" },
            { status: 401 }
        );
    }

    // Your protected logic goes here
    return NextResponse.json({
        success: true,
        message: "Authenticated successfully. This data is protected.",
        timestamp: new Date().toISOString(),
    });
}

// Example of a protected POST request
export async function POST(req: NextRequest) {
    if (!isAuthenticated(req)) {
        return NextResponse.json(
            { error: "Unauthorized access", message: "Missing or invalid API key" },
            { status: 401 }
        );
    }

    const body = await req.json();

    return NextResponse.json({
        success: true,
        message: "Data received successfully via authorized POST request.",
        receivedData: body,
    });
}
