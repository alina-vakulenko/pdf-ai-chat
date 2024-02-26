"use client";

import { useState } from "react";
import Dropzone from "react-dropzone";
import { useRouter } from "next/navigation";
import { Cloud } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { trpc } from "@/app/_trpc/client";
import { useUploadProgress } from "@/lib/hooks/useUploadProgress";
import { useToast } from "../ui/use-toast";
import UploadProgress from "./UploadProgress";
import UploadedFilePreview from "./UploadedFilePreview";

const UploadDropzone = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { uploadProgress, updateUploadProgress, finishUpload } =
    useUploadProgress();
  const [isUploading, setIsUploading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const { data: presignedUrl, refetch } = trpc.getPresignedUrl.useQuery({
    isSubscribed,
  });

  const { mutate: createFile } = trpc.createFile.useMutation({
    onSuccess: async (file) => {
      setFile(null);
      router.push(`${ROUTES.dashboard}/${file.id}`);
    },
  });

  const saveFile = async (file: File) => {
    refetch();
    if (!presignedUrl?.fields.key) {
      return toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    }
    try {
      const formData = new FormData();
      Object.keys(presignedUrl.fields).forEach((key) =>
        formData.append(key, presignedUrl.fields[key])
      );
      formData.append("file", file);

      await fetch(presignedUrl.url, {
        method: "POST",
        body: formData,
      });

      const createdFile = createFile({
        name: file.name,
        key: presignedUrl.fields.key,
        url: `${presignedUrl.url}${presignedUrl.fields.key}`,
        isSubscribed,
      });

      return createdFile;
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFiles) => {
        setIsUploading(true);
        setFile(acceptedFiles[0]);

        const progressInterval = updateUploadProgress();

        await saveFile(acceptedFiles[0]);

        clearInterval(progressInterval);
        finishUpload();
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          onClick={(e) => e.stopPropagation()} // prevent file picker to open twice
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinx-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or grad
                  and drop
                </p>
                <p className="text-xs text-zinc-500">
                  PDF (up to {isSubscribed ? "16" : "4"}MB)
                </p>
              </div>
              {acceptedFiles && acceptedFiles[0] ? (
                <UploadedFilePreview fileName={acceptedFiles[0].name} />
              ) : null}

              {isUploading ? <UploadProgress value={uploadProgress} /> : null}

              <input
                type="file"
                id="dropzone-file"
                className="hidden"
                {...getInputProps()}
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

export default UploadDropzone;
