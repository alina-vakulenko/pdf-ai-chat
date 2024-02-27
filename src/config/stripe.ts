export const PLANS = [
  {
    name: "Free",
    slug: "free",
    quota: 10,
    maxSizeBytes: 4 * 1024 * 1024,
    pagesPerPdf: 5,
    price: { amount: 0, priceIds: { test: "", production: "" } },
  },
  {
    name: "Pro",
    slug: "pro",
    quota: 50,
    maxSizeBytes: 16 * 1024 * 1024,
    pagesPerPdf: 25,
    price: {
      amount: 14,
      priceIds: { test: "price_1OjR0WKTA7bFkq8AeHe1Ou3n", production: "" },
    },
  },
];

export const FREE_PLAN = PLANS.find((plan) => plan.name === "Free")!;
export const PRO_PLAN = PLANS.find((plan) => plan.name === "Pro")!;
