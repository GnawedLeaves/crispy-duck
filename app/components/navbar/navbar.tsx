import { token } from "@/app/theme";
import Link from "next/link";
import styles from "./navbar.module.css";
const Navbar = () => {
  return (
    <div className="fixed w-full h-fit px-2 py-6 bottom-0 flex items-center justify-center">
      <div
        className={`cardWithShadow flex gap-8 items-center justify-center rounded-3xl py-3 px-6 border-2 `}
        style={{
          backgroundColor: token.light.background,
          borderColor: token.light.borderColor,
        }}
      >
        <div className={styles.navbarItem}>
          <Link href={"/"}>Home</Link>
        </div>

        <div className={styles.navbarItem}>
          <Link href={"/stats"}>Stats</Link>
        </div>
        <div className={styles.navbarItem}>
          <Link href={"/scan"}>Scan</Link>
        </div>
        <div className={styles.navbarItem}>
          <Link href={"/friends"}>Friends</Link>
        </div>
        <div className={styles.navbarItem}>
          <Link href={"/profile"}>Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
