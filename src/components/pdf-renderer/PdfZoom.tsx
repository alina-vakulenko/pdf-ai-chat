import { ChevronDown, Search } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type PdfZoomProps = {
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
};

const PdfZoom = ({ zoom, setZoom }: PdfZoomProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="zoom" variant="ghost" className="gap-1.5">
          <Search className="h-4 w-4" />
          {zoom * 100}%<ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => setZoom(1)}>100%</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setZoom(1.5)}>150%</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setZoom(2)}>200%</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setZoom(2.5)}>250%</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PdfZoom;
