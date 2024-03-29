import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types";
import { ROUTES } from "@/config/routes";
import { buttonVariants } from "../ui/button";
import MaxWidthWrapper from "../MaxWidthWrapper";
import UserAccountNav from "./UserAccountNav";
import MobileNav from "./MobileNav";

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex items-center justify-between h-14 border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            quill.
          </Link>
          <MobileNav isAuth={!!user} />
          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? <GuestMenu /> : <AuthedMenu user={user} />}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;

type AuthedMenuProps = {
  user: KindeUser;
};

const AuthedMenu = ({ user }: AuthedMenuProps) => {
  return (
    <>
      <Link
        href={ROUTES.dashboard}
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        Dashboard
      </Link>
      <UserAccountNav
        name={
          !user.given_name || !user.family_name
            ? "Your account"
            : user.given_name !== user.family_name
            ? `${user.given_name} ${user.family_name}`
            : user.given_name
        }
        email={user.email}
        avatarUrl={user.picture}
      />
    </>
  );
};

const GuestMenu = () => {
  return (
    <>
      <Link
        href={ROUTES.pricing}
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        Pricing
      </Link>
      <LoginLink className={buttonVariants({ variant: "ghost", size: "sm" })}>
        Sign in
      </LoginLink>
      <RegisterLink className={buttonVariants({ size: "sm" })}>
        Get started <ArrowRight className="ml-1.5 h-5 w-5" />
      </RegisterLink>
    </>
  );
};
