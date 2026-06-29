"use client";
import { withDelay } from "@/app/utils/common";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const Backbar = () => {
  const router = useRouter();

  const handleNavigateBack = withDelay(() => {
    router.back();
  });
  return (
    <div
      style={{
        display: "flex",
        padding: "2rem 2rem 0 2rem",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <button className="standardButton" onClick={handleNavigateBack}>
        <ArrowLeft />
      </button>
    </div>
  );
};

export default Backbar;
