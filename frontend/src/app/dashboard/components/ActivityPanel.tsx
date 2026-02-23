"use client";

export default function ActivityPanel({
    activityLog,
}: {
    activityLog: any[];
}) {
    return (
        <div className="fixed left-0 top-0 w-80 h-full bg-white shadow-lg p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
                Activity Log
            </h2>

            {activityLog.map((item, index) => (
                <div
                    key={index}
                    className="mb-3 text-sm border-b pb-2"
                >
                    <div>
                        <span className="font-medium">
                            {item.user?.name || item.user?.email}
                        </span>{" "}
                        {item.action}
                    </div>

                    <div className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    );
}
