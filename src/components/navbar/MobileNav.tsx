"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";
import { ROUTES } from "@/config/routes";

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      toggleOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen();
    }
  };

  return (
    <div className="sm:hidden">
      <Menu
        onClick={toggleOpen}
        className="relative z-50 h-5 w-5 text-zinc-700"
      />

      {isOpen ? (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
          <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {!isAuth ? (
              <AuthedMobileMenu closeOnCurrent={closeOnCurrent} />
            ) : (
              <GuestMobileMenu closeOnCurrent={closeOnCurrent} />
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default MobileNav;

type MobileMenuProps = {
  closeOnCurrent: (href: string) => void;
};

const AuthedMobileMenu = ({ closeOnCurrent }: MobileMenuProps) => {
  return (
    <>
      <li>
        <Link
          href={ROUTES.signUp}
          onClick={() => closeOnCurrent(ROUTES.signUp)}
          className="flex items-center w-full font-semibold text-green-600"
        >
          Get started <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </li>
      <li className="my-3 h-px w-full bg-gray-300" />
      <li>
        <Link
          href={ROUTES.signIn}
          onClick={() => closeOnCurrent(ROUTES.signIn)}
          className="flex items-center w-full font-semibold"
        >
          Sign in
        </Link>
      </li>
      <li className="my-3 h-px w-full bg-gray-300" />
      <li>
        <Link
          href={ROUTES.pricing}
          onClick={() => closeOnCurrent(ROUTES.pricing)}
          className="flex items-center w-full font-semibold text-green-600"
        >
          Pricing
        </Link>
      </li>
    </>
  );
};

const GuestMobileMenu = ({ closeOnCurrent }: MobileMenuProps) => {
  return (
    <>
      <li>
        <Link
          href={ROUTES.dashboard}
          onClick={() => closeOnCurrent(ROUTES.dashboard)}
          className="flex items-center w-full font-semibold"
        >
          Dashboard
        </Link>
      </li>
      <li className="my-3 h-px w-full bg-gray-300" />
      <li>
        <Link
          href={ROUTES.signOut}
          className="flex items-center w-full font-semibold text-green-600"
        >
          Sign out
        </Link>
      </li>
    </>
  );
};
