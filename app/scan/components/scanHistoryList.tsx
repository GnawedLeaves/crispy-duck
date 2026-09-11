"use client";

import CustomModal from "@/app/components/modal/customModal";
import { token } from "@/app/theme";
import { withDelay } from "@/app/utils/common";
import {
  deleteScanData,
  getUserTanitaScans,
} from "@/app/utils/supabase/scanAction";
import { TanitaScanRow } from "@/app/utils/supabase/scanTypes";
import { useToast } from "@/app/components/toast/toastNotification";
import dayjs from "dayjs";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ScanHistoryListProps {
  currentUserId: string;
  onEditScan: (scan: TanitaScanRow) => void;
  /** Bumped by the parent whenever a scan is saved elsewhere, to trigger a refetch. */
  refreshKey: number;
  /** Scan id to scroll back into view, e.g. after returning from editing it. */
  scrollToScanId?: string | null;
  onScrolledToScan?: () => void;
}

const ScanHistoryList = ({
  currentUserId,
  onEditScan,
  refreshKey,
  scrollToScanId,
  onScrolledToScan,
}: ScanHistoryListProps) => {
  const [scans, setScans] = useState<TanitaScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { triggerToast } = useToast();
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchScans = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getUserTanitaScans();
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setScans(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // After returning from editing a scan, scroll that card back into view
  // instead of leaving the user wherever the page happened to land.
  useEffect(() => {
    if (!scrollToScanId || loading) return;
    const el = rowRefs.current[scrollToScanId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    onScrolledToScan?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToScanId, loading, scans]);

  const handleConfirmDelete = withDelay(async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    const { error: deleteError } = await deleteScanData(
      pendingDeleteId,
      currentUserId,
    );
    setDeleting(false);
    setPendingDeleteId(null);
    if (deleteError) {
      triggerToast("Failed to delete scan", token.light.redColor, 4000);
      console.error(deleteError);
      return;
    }
    setScans((prev) => prev.filter((scan) => scan.id !== pendingDeleteId));
    triggerToast("Scan deleted!", token.light.primaryColor, 4000);
  });

  if (loading) {
    return (
      <div className="flexCenter w-full py-10">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cardWithShadow flex flex-col gap-3 text-center max-w-xs mx-auto">
        <p className="text-sm font-semibold">⚠️ Couldn't load your scans</p>
        <p className="text-sm opacity-60">{error}</p>
        <button className="standardButton" onClick={fetchScans}>
          Try again
        </button>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="cardWithShadow text-center max-w-xs mx-auto">
        <p className="text-sm opacity-60">
          No scans yet. Add your first scan to see it here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full max-w-lg mx-auto flex-col gap-3">
        {scans.map((scan) => (
          <div
            key={scan.id}
            ref={(el) => {
              rowRefs.current[scan.id] = el;
            }}
            className="cardWithShadow flex items-center justify-between gap-3"
          >
            <div className="flex flex-col gap-1">
              <div className="font-semibold">
                {dayjs(scan.scan_date).format("DD MMM YYYY")}
                {scan.scan_time && (
                  <span className="ml-2 text-xs opacity-60">
                    {scan.scan_time}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs opacity-70">
                <span>{scan.weight} kg</span>
                <span>BMI {scan.bmi}</span>
                <span>Fat {scan.fat_percentage}%</span>
                <span>Muscle {scan.muscle_mass} kg</span>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                aria-label="Edit scan"
                className="standardButton p-2"
                onClick={() => onEditScan(scan)}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                aria-label="Delete scan"
                className="standardButton p-2"
                style={{ background: token.light.redColor }}
                onClick={() => setPendingDeleteId(scan.id)}
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
        title="Delete this scan?"
        modalType="action"
        actionButtonText={deleting ? "Deleting..." : "Delete"}
        closeButtonText="Cancel"
        onActionClick={handleConfirmDelete}
      >
        <p className="text-sm opacity-70">
          This will permanently remove this scan from your history. This
          cannot be undone.
        </p>
      </CustomModal>
    </>
  );
};

export default ScanHistoryList;
