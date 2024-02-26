import { RotateCw } from "lucide-react";
import { Button } from "../ui/button";

type PdfRotateProps = {
  setRotation: React.Dispatch<React.SetStateAction<number>>;
};

const PdfRotate = ({ setRotation }: PdfRotateProps) => {
  return (
    <Button
      aria-label="rotate 90 degrees"
      variant="ghost"
      onClick={() => setRotation((prev) => prev + 90)}
    >
      <RotateCw className="h-4 w-4" />
    </Button>
  );
};

export default PdfRotate;
