"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

// Routes that should render WITHOUT the sidebar
const NO_SIDEBAR_ROUTES = ["/", "/login", "/register"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicRoute = NO_SIDEBAR_ROUTES.includes(pathname) || pathname.startsWith("/certificate");

    if (isPublicRoute) {
        return <main className="min-h-screen">{children}</main>;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0">{children}</main>
        </div>
    );
}
