import { token } from "@/app/theme";

interface StepsBarProps {
  totalSegments: number;
  currentSegment: number;
}

const StepsBar = ({ totalSegments, currentSegment }: StepsBarProps) => {
  const items = Array.from({ length: totalSegments });
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
};
export default StepsBar;
