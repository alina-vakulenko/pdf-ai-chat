"use client";

import { useState } from "react";
import Dropzone from "react-dropzone";
import { useRouter } from "next/navigation";
import { Cloud } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "./ui/use-toast";
import UploadProgress from "./UploadProgress";
import UploadedFilePreview from "./UploadedFilePreview";
import { useUploadProgress } from "./useUploadProgress";

const UploadDropzone = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { uploadProgress, updateUploadProgress, finishUpload } =
    useUploadProgress();
  const [isUploading, setIsUploading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [fileBlob, setFileBlob] = useState(Blob);
  const { data: presignedUrl } = trpc.createSignedUrl.useQuery(undefined, {
    enabled: !!file,
  });

  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`);
    },
    retry: true,
    retryDelay: 500,
  });

  const { mutate: createFile } = trpc.createFile.useMutation({
    onSuccess: async (file) => {
      console.log("file saved to db and processed by pinecone");
      console.log(file);
      setFile(null);
    },
  });

  const saveFile = async (file: File) => {
    if (!presignedUrl?.key) {
      return toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    }

    const formData = new FormData();
    formData.set("file", file);

    const res = await fetch(presignedUrl.url, {
      method: "PUT",
      body: formData,
    });

    console.log("res to save s3", res);

    const createdFile = createFile({
      name: file.name,
      key: presignedUrl.key,
      url: `https://stream-bucket1.s3.eu-north-1.amazonaws.com/${presignedUrl.key}`,
    });

    return createdFile;
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
        startPolling({ key: presignedUrl?.key! });
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
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
                <p className="text-xs text-zinc-500">PDF (up to 4MB)</p>
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
