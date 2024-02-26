import { Ghost } from "lucide-react";

const EmptyDashboard = () => {
  return (
    <div className="mt-16 flex flex-col items-center gap-2">
      <Ghost className="h-8 w-8 text-zinc-800" />
      <h3>Pretty empty around here</h3>
      <p>Let&apos;s upload your first PDF.</p>
    </div>
  );
};

export default EmptyDashboard;
