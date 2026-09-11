import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserAiAnalyses } from "@/app/utils/supabase/aiAnalysisAction";
import AiAnalysisList from "./components/aiAnalysisList";

const AiAnalysisListPage = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await getUserAiAnalyses();

  return (
    <main className="contentLayout">
      <div className="text-3xl text-center mb-4 font-bold">Past Analyses</div>
      <AiAnalysisList currentUserId={user.id} initialAnalyses={data ?? []} />
    </main>
  );
};

export default AiAnalysisListPage;
