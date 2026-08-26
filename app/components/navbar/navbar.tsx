"use client";

import { useAuth } from "@/app/context/AuthContext";
import { token } from "@/app/theme";
import { ChartColumn, ScanLine, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ViewTransition } from "react";
import styles from "./navbar.module.css";

const Navbar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const isActiveMany = (paths: string[]) => {
    const res = paths.find((path) => pathname.includes(path));
    if (res) return true;
    return false;
  };

  if (user && !pathname.includes("/login")) {
    return (
      <ViewTransition name="footer">
        <div className="fixed inset-x-0 bottom-0 flex items-center justify-center pb-6 px-2 z-50 pointer-events-none">
          <div
            className="cardWithShadow flex gap-8 items-center justify-center rounded-3xl border-2 pointer-events-auto"
            style={{
              backgroundColor: token.light.background,
              borderColor: token.light.borderColor,
            }}
          >
            <div
              className={`${styles.navbarItem} ${isActive("/stats") ? styles.selectedNavItem : styles.unselectedNavItem}`}
            >
              <Link href={"/stats"}>
                <ChartColumn />
              </Link>
            </div>
            <div
              className={`${styles.navbarItem} ${isActive("/scan") ? styles.selectedNavItem : styles.unselectedNavItem}`}
            >
              <Link href={"/scan"}>
                <ScanLine />
              </Link>
            </div>
            <div
              className={`${styles.navbarItem} ${isActiveMany(["/friends", "/profile"]) ? styles.selectedNavItem : styles.unselectedNavItem}`}
            >
              <Link href={"/friends"}>
                <Users />
              </Link>
            </div>
          </div>
        </div>
      </ViewTransition>
    );
  }
};

export default Navbar;
