import Link from "next/link";

type FileLinkProps = {
  href: string;
  fileName: string;
};

const FileLink = ({ href, fileName }: FileLinkProps) => {
  return (
    <Link href={href} className="flex flex-col gap-2">
      <div className=" pt-6 px-6 flex w-full items-center justify-between space-x-6">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <h3 className="truncate text-lg font-medium text-zinc-900">
              {fileName}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FileLink;
