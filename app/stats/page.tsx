import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileBanner from "../components/profile/profileBanner";
import CurrentStatsComponent from "./components/currentStats/currentStats";
import { getUserTanitaScans } from "../utils/supabase/scanAction";

const page = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await getUserTanitaScans();

  return (
    <div className="contentLayout">
      <ProfileBanner />
      <CurrentStatsComponent data={data} />
    </div>
  );
};

export default page;
