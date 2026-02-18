"use client";

import { useEffect, useState } from "react";

export default function WidgetConfigPanel({
    widget,
    onClose,
    onSave,
}: {
    widget: any;
    onClose: () => void;
    onSave: (updatedConfig: any) => void;
}) {
    const [localConfig, setLocalConfig] = useState<any>(null);

    useEffect(() => {
        if (widget) {
            setLocalConfig(widget.config);
        }
    }, [widget]);

    if (!widget || !localConfig) return null;

    return (
        <div className="fixed right-0 top-0 w-80 h-full bg-white shadow-lg p-6 z-50">
            <h2 className="text-lg font-semibold mb-4">
                Configure Widget
            </h2>

            {widget.type === "text" && (
                <input
                    className="border p-2 w-full mb-4"
                    value={localConfig.text || ""}
                    onChange={(e) =>
                        setLocalConfig({
                            ...localConfig,
                            text: e.target.value,
                        })
                    }
                />
            )}

            {widget.type === "kpi" && (
                <>
                    <input
                        className="border p-2 w-full mb-2"
                        value={localConfig.title || ""}
                        onChange={(e) =>
                            setLocalConfig({
                                ...localConfig,
                                title: e.target.value,
                            })
                        }
                    />
                    <input
                        className="border p-2 w-full"
                        type="number"
                        value={localConfig.value || 0}
                        onChange={(e) =>
                            setLocalConfig({
                                ...localConfig,
                                value: Number(e.target.value),
                            })
                        }
                    />
                </>
            )}

            <div className="flex gap-2 mt-6">
                <button
                    onClick={() => {
                        onSave(localConfig);
                        onClose();
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Save
                </button>

                <button
                    onClick={onClose}
                    className="bg-gray-200 px-4 py-2 rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
