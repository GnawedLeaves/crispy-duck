import { ProgressBar } from "@/app/components/charts/tremor/ProgressBar";

interface StatItemProps {
  title: string;
  progressString?: string;
  progressPercentage: number;
  color?: string;
}

const ProgressBarStatItem = ({
  title,
  progressString,
  progressPercentage = 5,
}: StatItemProps) => {
  return (
    <div>
      <div className="flex justify-between ">
        <div>{title ?? "-"}</div>
        <div>{progressString ?? "-"}</div>
      </div>
      <ProgressBar
        value={progressPercentage}
        className="mx-auto"
        variant="default"
      />
    </div>
  );
};

export default ProgressBarStatItem;
