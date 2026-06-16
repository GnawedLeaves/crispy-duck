"use client";

import { startTransition, useState, ViewTransition } from "react";

const TestComponent = () => {
  const [showItem, setShowItem] = useState<boolean>(false);

  const Item = () => {
    return (
      <ViewTransition enter="enter-right" exit="exit-left" default="none">
        <div>This is my item</div>
        <div className="w-30 h-20 bg-red-400 "></div>
      </ViewTransition>
    );
  };
  return (
    <div className="cardWithShadow mt-10">
      Hello
      <button
        className="standardButton"
        onClick={() => {
          startTransition(() => {
            setShowItem(!showItem);
          });
        }}
      >
        Show / Hide Item
      </button>
      Hello
      {showItem && <Item />}
    </div>
  );
};
export default TestComponent;
