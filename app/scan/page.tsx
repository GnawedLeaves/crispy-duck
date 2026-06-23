// app/scan/page.tsx (or wherever your scan route lives)
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { handleFileUpload } from "@/app/utils/supabase/scanAction";
import { redirect } from "next/navigation";
import ScannerView from "./components/scannerview";
import ProfileBanner from "../components/profile/profileBanner";
import { ViewTransition } from "react";

export default async function ScanPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <ViewTransition>
      <main className="contentLayout">
        <div className="text-4xl text-center mb-4 font-bold">Scan</div>

        <ScannerView
          handleFileUpload={handleFileUpload}
          currentUserId={user.id}
        />
      </main>
    </ViewTransition>
  );
}
