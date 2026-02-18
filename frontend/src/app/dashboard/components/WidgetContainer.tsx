export default function WidgetContainer({
  widget,
  onEdit,
}: {
  widget: any;
  onEdit: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 h-full border border-gray-200 relative">
      <button
        onClick={onEdit}
        className="absolute top-2 right-2 text-xs text-blue-500"
      >
        Edit
      </button>

      {widget.type === "text" && (
        <div>
          <h3 className="font-medium mb-2">Text Widget</h3>
          <p className="text-gray-600">
            {widget?.config?.text}
          </p>
        </div>
      )}

      {widget.type === "kpi" && (
        <div>
          <h3 className="font-medium mb-2">
            {widget?.config?.title}
          </h3>
          <p className="text-2xl font-bold">
            {widget?.config?.value}
          </p>
        </div>
      )}
    </div>
  );
}
