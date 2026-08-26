// app/scan/page.tsx (or wherever your scan route lives)
import { handleFileUpload } from "@/app/utils/supabase/scanAction";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ViewTransition } from "react";
import ScannerView from "./components/scannerview";

export default async function ScanPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const handleFileUploadWrapper = async (file: File) => {
    "use server";
    const formData = new FormData();
    formData.append("file", file);
    return handleFileUpload(formData);
  };

  return (
    <ViewTransition>
      <main className="contentLayout">
        <div className="text-4xl text-center mb-4 font-bold">Scan</div>

        <ScannerView
          handleFileUpload={handleFileUploadWrapper}
          currentUserId={user.id}
        />
      </main>
    </ViewTransition>
  );
}
