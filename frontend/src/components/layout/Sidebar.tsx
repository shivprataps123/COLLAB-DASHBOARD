"use client";

import { useRouter } from "next/navigation";

export default function Sidebar() {
    const router = useRouter();

    return (
        <div className="w-64 bg-gray-900 text-white h-screen p-6">
            <h2 className="text-lg font-semibold mb-6">
                Collab Dashboard
            </h2>

            <ul className="space-y-4 text-sm">
                <li className="hover:text-blue-400 cursor-pointer">
                    Dashboard
                </li>
                <li className="hover:text-blue-400 cursor-pointer">
                    Analytics
                </li>
                <li className="hover:text-blue-400 cursor-pointer">
                    Settings
                </li>
                <li
                    className="hover:text-blue-400 cursor-pointer"
                    onClick={() => router.push("/dashboard")}
                >
                    Dashboards
                </li>
            </ul>
        </div>
    );
}
