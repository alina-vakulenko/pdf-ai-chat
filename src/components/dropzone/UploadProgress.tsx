import { Loader2 } from "lucide-react";
import { Progress } from "../ui/progress";

type UploadProgressProps = {
  value: number;
};

const UploadProgress = ({ value }: UploadProgressProps) => {
  return (
    <div className="w-full max-w-xs max-auto mt-4">
      <Progress
        indicatorColor={value === 100 ? "bg-green-500" : ""}
        value={value}
        className="h-1 w-fill bg-zinc-200"
      />
      {value === 100 ? (
        <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
          <Loader2 className="h-2 w-3 animate-spin" />
          Redirecting...
        </div>
      ) : null}
    </div>
  );
};

export default UploadProgress;
