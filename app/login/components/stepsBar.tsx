import { token } from "@/app/theme";

interface StepsBarProps {
  totalSegments: number;
  currentSegment: number;
  showWholeBar?: boolean;
}

const StepsBar = ({
  totalSegments,
  currentSegment,
  showWholeBar = true,
}: StepsBarProps) => {
  const items = Array.from({ length: totalSegments });
  if (showWholeBar) {
    return (
      <div className="w-full h-4 p-1 flex gap-1 fixed left-0 bottom-0">
        {items.map((item, index) => {
          return (
            <div
              key={index}
              className="flex-1 h-full rounded-md transition-colors duration-300"
              style={{
                background:
                  currentSegment >= index + 1
                    ? token.light.textColor
                    : token.light.tempGrey,
              }}
            ></div>
          );
        })}
      </div>
    );
  }
  return <></>;
};
export default StepsBar;
