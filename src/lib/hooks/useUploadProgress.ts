import { useState } from "react";

export const useUploadProgress = () => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const updateUploadProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5; // increment progress in 5% step
      });
    }, 500);

    return interval;
  };

  const finishUpload = () => {
    setUploadProgress(100);
  };

  return {
    uploadProgress,
    updateUploadProgress,
    finishUpload,
  };
};
