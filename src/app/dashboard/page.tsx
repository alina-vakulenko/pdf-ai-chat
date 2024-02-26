import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import Dashboard from "@/components/dashboard/Dashboard";
import { ROUTES } from "@/config/routes";

const DashboardPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) redirect(ROUTES.authCallback + "?origin=dashboard");

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect(`${ROUTES.authCallback}?origin=dashboard`);

  const subscriptionPlan = await getUserSubscriptionPlan();

  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default DashboardPage;
