"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useResizeDetector } from "react-resize-detector";
import { Document, Page, pdfjs } from "react-pdf";
import SimpleBar from "simplebar-react";
import { cn } from "@/lib/utils";
import { usePdfPagination } from "../../lib/hooks/usePdfPagination";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import PdfFullScreen from "./PdfFullScreen";
import PdfZoom from "./PdfZoom";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import PdfRotate from "./PdfRotate";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRendererProps {
  fileUrl: string;
}

const PdfRenderer = ({ fileUrl }: PdfRendererProps) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const isLoading = renderedScale !== zoom;

  const {
    handlePrevClick,
    handleNextClick,
    handlePageSubmit,
    setPagesCount,
    isPrevDisabled,
    isNextDisabled,
    currPage,
    pagesCount,
    CustomPageValidator,
  } = usePdfPagination();

  type Page = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Page>({
    defaultValues: { page: "1" },
    resolver: zodResolver(CustomPageValidator),
  });

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/** TOOLBAR START */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        {/** PAGINATION */}
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => {
              handlePrevClick();
              setValue("page", String(currPage - 1));
            }}
            disabled={isPrevDisabled}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                  setValue("page", String(currPage));
                }
              }}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{pagesCount || "x"}</span>
            </p>
          </div>

          <Button
            onClick={() => {
              handleNextClick();
              setValue("page", String(currPage + 1));
            }}
            disabled={isNextDisabled}
            variant="ghost"
            aria-label="next page"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
        {/** TOOLS */}
        <div className="space-x-2">
          <PdfZoom zoom={zoom} setZoom={setZoom} />
          <PdfRotate setRotation={setRotation} />
          <PdfFullScreen fileUrl={fileUrl} />
        </div>
      </div>
      {/** TOOLBAR END */}
      {/** PDF VIEWER */}
      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              file={fileUrl}
              className="max-h-full"
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error loading PDF",
                  description: "Please try again later",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => setPagesCount(numPages)}
            >
              {isLoading && renderedScale ? (
                <Page
                  key={"@" + renderedScale}
                  pageNumber={currPage}
                  width={width ? width : 1}
                  scale={zoom}
                  rotate={rotation}
                />
              ) : null}

              <Page
                key={"@" + zoom}
                className={cn(isLoading ? "hidden" : "")}
                pageNumber={currPage}
                width={width ? width : 1}
                scale={zoom}
                rotate={rotation}
                loading={
                  <div className="felx justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => {
                  setRenderedScale(zoom);
                }}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
