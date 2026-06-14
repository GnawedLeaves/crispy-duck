"use client";

import { token } from "@/app/theme";
import Link from "next/link";
import styles from "./navbar.module.css";
import {
  House,
  ScanLine,
  Users,
  CircleUserRound,
  ChartColumn,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { usePathname } from "next/navigation";
const Navbar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  if (user) {
    return (
      <div className="fixed w-full h-fit px-2 py-6 bottom-0 flex items-center justify-center">
        <div
          className={`cardWithShadow flex gap-8 items-center justify-center rounded-3xl border-2 `}
          style={{
            backgroundColor: token.light.background,
            borderColor: token.light.borderColor,
          }}
        >
          <div
            className={`${styles.navbarItem}  ${isActive("/") ? styles.selectedNavItem : styles.unselectedNavItem}`}
          >
            <Link href={"/"}>
              <House />
            </Link>
          </div>

          <div
            className={`${styles.navbarItem} ${isActive("/stats") ? styles.selectedNavItem : styles.unselectedNavItem}`}
          >
            <Link href={"/stats"}>
              <ChartColumn />
            </Link>
          </div>
          <div
            className={`${styles.navbarItem}  ${isActive("/scan") ? styles.selectedNavItem : styles.unselectedNavItem}`}
          >
            <Link href={"/scan"}>
              <ScanLine />
            </Link>
          </div>
          <div
            className={`${styles.navbarItem}  ${isActive("/friends") ? styles.selectedNavItem : styles.unselectedNavItem}`}
          >
            <Link href={"/friends"}>
              <Users />
            </Link>
          </div>
          {/* <div
            className={`${styles.navbarItem}  ${isActive("/profile") ? styles.selectedNavItem : styles.unselectedNavItem}`}
          >
            <Link href={"/profile"}>
              <CircleUserRound />
            </Link>
          </div> */}
        </div>
      </div>
    );
  }
};

export default Navbar;
