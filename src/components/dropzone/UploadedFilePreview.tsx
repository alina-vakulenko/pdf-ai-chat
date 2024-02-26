import { File } from "lucide-react";

type UploadedFilePreviewProps = {
  fileName: string;
};

const UploadedFilePreview = ({ fileName }: UploadedFilePreviewProps) => {
  return (
    <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
      <div className="px-3 py-2 h-full grid place-items-center">
        <File className="h-4 w-4 text-blue-500" />
      </div>
      <div className="px-3 py-2 h-full text-sm truncate">{fileName}</div>
    </div>
  );
};

export default UploadedFilePreview;
