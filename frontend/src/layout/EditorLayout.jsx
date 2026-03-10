import { useState, useRef } from "react";

export default function EditorLayout({left, query, results}) {
  const [leftWidth, setLeftWidth] = useState(30);
  const [topHeight, setTopHeight] = useState(70);

  const containerRef = useRef(null);
  const rightRef = useRef(null);

  const handleHorizontalResize = (e) => {
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;

    const handleMouseMove = (e) => {
      const newWidth =
        ((e.clientX - container.getBoundingClientRect().left) /
          containerWidth) *
        100;

      if (newWidth > 20 && newWidth < 80) {
        setLeftWidth(newWidth);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", handleMouseMove);
    }, { once: true });
  };

  const handleVerticalResize = (e) => {
    const container = rightRef.current;
    const containerHeight = container.offsetHeight;

    const handleMouseMove = (e) => {
      const newHeight =
        ((e.clientY - container.getBoundingClientRect().top) /
          containerHeight) *
        100;

      if (newHeight > 20 && newHeight < 80) {
        setTopHeight(newHeight);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", handleMouseMove);
    }, { once: true });
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#0a0a0a] h-screen text-white flex p-4"
    >
      <div
        style={{ width: `${leftWidth}%` }}
        className="bg-[#141414] rounded-lg p-4 border border-gray-800"
      >
        {left}
      </div>

      <div
        onMouseDown={handleHorizontalResize}
        className="w-2 cursor-col-resize bg-dark hover:bg-gray-500"
      />

      <div
        ref={rightRef}
        style={{ width: `${100 - leftWidth}%` }}
        className="flex flex-col"
      >
        <div
          style={{ height: `${topHeight}%` }}
          className="bg-[#141414] rounded-lg p-4 border border-gray-800 overflow-hidden"
        >
          {query}
        </div>

        <div
          onMouseDown={handleVerticalResize}
          className="h-2 flex-none cursor-row-resize bg-dark hover:bg-gray-500"
        />

        <div
          style={{ height: `${100 - topHeight}%` }}
          className="bg-[#141414] rounded-lg p-4 border border-gray-800 overflow-hidden"
        >
          {results}
        </div>
      </div>
    </div>
  );
}