import { useState } from "react";
import { z } from "zod";

export const usePdfPagination = () => {
  const [currPage, setCurrPage] = useState(1);
  const [pagesCount, setPagesCount] = useState<number>();

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((val) => Number(val) > 0 && Number(val) <= pagesCount!),
  });

  type Page = z.infer<typeof CustomPageValidator>;

  const handlePageSubmit = ({ page }: Page) => {
    setCurrPage(Number(page));
  };

  const handlePrevClick = () => {
    setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
  };

  const handleNextClick = () => {
    setCurrPage((prev) => (prev + 1 > pagesCount! ? pagesCount! : prev + 1));
  };

  const isPrevDisabled = currPage <= 1;
  const isNextDisabled = !pagesCount || currPage === pagesCount;

  return {
    handlePrevClick,
    handleNextClick,
    handlePageSubmit,
    setPagesCount,
    isPrevDisabled,
    isNextDisabled,
    currPage,
    pagesCount,
    CustomPageValidator,
  };
};
