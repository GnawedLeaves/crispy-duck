import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAiAnalysisById } from "@/app/utils/supabase/aiAnalysisAction";
import AiAnalysisDetail from "../components/aiAnalysisDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

const AiAnalysisDetailPage = async ({ params }: PageProps) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { data: analysis } = await getAiAnalysisById(id);

  if (!analysis) redirect("/stats/analysis");

  return (
    <main className="contentLayout">
      <AiAnalysisDetail analysis={analysis} />
    </main>
  );
};

export default AiAnalysisDetailPage;
