import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileBanner from "../components/profile/profileBanner";
import CurrentStatsComponent from "./components/currentStats/currentStats";
import { getUserTanitaScans } from "../utils/supabase/scanAction";
import { getBodyScanData } from "../utils/supabase/getBodyScanDataAction";

const page = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await getUserTanitaScans();
  const trendData = await getBodyScanData();
  return (
    <div className="contentLayout">
      <ProfileBanner />
      <CurrentStatsComponent trendData={trendData} />
    </div>
  );
};

export default page;
