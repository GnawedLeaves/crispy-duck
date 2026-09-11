"use client";

import CustomModal from "@/app/components/modal/customModal";
import { useToast } from "@/app/components/toast/toastNotification";
import { token } from "@/app/theme";
import { withDelay } from "@/app/utils/common";
import { deleteAiAnalysis } from "@/app/utils/supabase/aiAnalysisAction";
import { AiAnalysisSummary } from "@/app/utils/supabase/aiAnalysisTypes";
import dayjs from "dayjs";
import { Eye, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AiAnalysisListProps {
  currentUserId: string;
  initialAnalyses: AiAnalysisSummary[];
}

const excerpt = (text: string, maxLength = 140) =>
  text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;

const AiAnalysisList = ({
  currentUserId,
  initialAnalyses,
}: AiAnalysisListProps) => {
  const [analyses, setAnalyses] = useState(initialAnalyses);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { triggerToast } = useToast();
  const router = useRouter();

  const handleViewAnalysis = withDelay((id: string) => {
    router.push(`/stats/analysis/${id}`);
  });

  const handleDeleteClick = withDelay((id: string) => {
    setPendingDeleteId(id);
  });

  const handleConfirmDelete = withDelay(async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    const { error } = await deleteAiAnalysis(pendingDeleteId, currentUserId);
    setDeleting(false);
    setPendingDeleteId(null);
    if (error) {
      triggerToast("Failed to delete analysis", token.light.redColor, 4000);
      console.error(error);
      return;
    }
    setAnalyses((prev) => prev.filter((a) => a.id !== pendingDeleteId));
    triggerToast("Analysis deleted!", token.light.primaryColor, 4000);
  });

  if (analyses.length === 0) {
    return (
      <div className="cardWithShadow text-center max-w-xs mx-auto">
        <p className="text-sm opacity-60">
          No AI analyses yet. Generate one from your stats page to see it
          here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full max-w-lg mx-auto flex-col gap-3">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="cardWithShadow flex items-center justify-between gap-3 cursor-pointer"
            onClick={() => handleViewAnalysis(analysis.id)}
          >
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="w-4 h-4 shrink-0" />
                {dayjs(analysis.created_at).format("DD MMM YYYY, HH:mm")}
              </div>
              <div className="text-xs opacity-70 truncate">
                {excerpt(analysis.analysis_text)}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                aria-label="View analysis"
                className="standardButton p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewAnalysis(analysis.id);
                }}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                aria-label="Delete analysis"
                className="standardButton p-2"
                style={{ background: token.light.redColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(analysis.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <CustomModal
        isOpen={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        title="Delete this analysis?"
        modalType="action"
        actionButtonText={deleting ? "Deleting..." : "Delete"}
        closeButtonText="Cancel"
        onActionClick={handleConfirmDelete}
      >
        <p className="text-sm opacity-70">
          This will permanently remove this AI analysis. This cannot be
          undone.
        </p>
      </CustomModal>
    </>
  );
};

export default AiAnalysisList;
