interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REQUESTED: "bg-blue-100 text-blue-800",
  OFFICER_REVIEW: "bg-indigo-100 text-indigo-800",
  CONTROLLER_REVIEW: "bg-purple-100 text-purple-800",
  CONTROLLER_APPROVAL: "bg-purple-100 text-purple-800",
  HEAD_APPROVAL: "bg-pink-100 text-pink-800",
  ADMIN_REVIEW: "bg-indigo-100 text-indigo-800",
  UNDER_REVIEW: "bg-indigo-100 text-indigo-800",
  FINANCE_CONFIRMATION: "bg-cyan-100 text-cyan-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-green-100 text-green-800",
  SIGNED: "bg-teal-100 text-teal-800",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClass}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
