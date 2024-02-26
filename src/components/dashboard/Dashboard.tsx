"use client";

import Skeleton from "react-loading-skeleton";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { ROUTES } from "@/config/routes";
import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import EmptyDashboard from "./EmptyDashboard";
import FileLink from "./FileLink";
import FileToolbar from "./FileToolbar";

type DashboardProps = {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
};

const Dashboard = ({ subscriptionPlan }: DashboardProps) => {
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();
  const sortedFiles = files?.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My Files</h1>
        <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
      </div>

      {sortedFiles && sortedFiles.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {sortedFiles.map((file) => (
            <li
              key={file.id}
              className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
            >
              <FileLink
                href={`${ROUTES.dashboard}/${file.id}`}
                fileName={file.name}
              />
              <FileToolbar fileId={file.id} createdAt={file.createdAt} />
            </li>
          ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        <EmptyDashboard />
      )}
    </main>
  );
};

export default Dashboard;
