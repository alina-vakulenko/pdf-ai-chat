"use client";

import { useState } from "react";
import { Loader2, MessagesSquare, Plus, Trash } from "lucide-react";
import { format } from "date-fns";
import { trpc } from "@/app/_trpc/client";
import { Button } from "../ui/button";

type FileToolbarProps = {
  fileId: string;
  createdAt: string;
};

const FileToolbar = ({ fileId, createdAt }: FileToolbarProps) => {
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onMutate: ({ id }) => {
      setFileToDelete(id);
    },
    onSuccess: () => {
      utils.getUserFiles.invalidate();
    },
    onSettled: () => {
      setFileToDelete(null);
    },
  });

  return (
    <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        {format(new Date(createdAt), "MMM yyyy")}
      </div>
      <div className="flex items-center gap-2">
        <MessagesSquare className="h-4 w-4" />
        mocked
      </div>
      <Button
        onClick={() => deleteFile({ id: fileId })}
        size="sm"
        className="w-full"
        variant="destructive"
        aria-label="Delete file"
      >
        {fileToDelete === fileId ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default FileToolbar;
