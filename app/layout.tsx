import "../styles/globals.css";
import React, {ReactNode} from "react";

export const metadata = {title: "BoingChat"};

export default function RootLayout({children}:{children: ReactNode}) {
    return (
        <html lang="en">
            <body className = "min-h-screen bg-neutral-950 text-neutral-100">
                {children}
            </body>
        </html>
    );
}