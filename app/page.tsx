import { redirect } from "next/navigation";
import ProfileBanner from "./components/profile/profileBanner";
import { useAuth } from "./context/AuthContext";
import SignOutForm from "./login/components/signOutForm";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className={"contentLayout"}>
      dashboard
      <div>
        <ProfileBanner />
      </div>
      For emergency:
      <SignOutForm />
    </div>
  );
}
