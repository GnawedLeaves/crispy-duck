import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileBanner from "../components/profile/profileBanner";
import CurrentStatsComponent from "./components/currentStats/currentStats";
import { getUserTanitaScans } from "../utils/supabase/scanAction";
import { getBodyScanData } from "../utils/supabase/getBodyScanDataAction";
import { ViewTransition } from "react";

const page = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const trendData = await getBodyScanData();
  return (
    <ViewTransition>
      <div className="contentLayout">
        <div className="text-4xl text-center mb-4 font-bold">Stats</div>

        <CurrentStatsComponent trendData={trendData} />
      </div>
    </ViewTransition>
  );
};

export default page;
