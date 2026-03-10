import { useState, useRef } from "react";
import Navbar from "../components/Navbar";

export default function EditorLayout({ left, query, results }) {
  const [leftWidth, setLeftWidth] = useState(30);
  const [topHeight, setTopHeight] = useState(70);

  const containerRef = useRef(null);
  const rightRef = useRef(null);

  const handleHorizontalResize = () => {
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

  const handleVerticalResize = () => {
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
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
      <Navbar />
      <div
        ref={containerRef}
        className="flex-1 text-white flex p-4 gap-1 min-h-0"
      >
        <div
          style={{ width: `${leftWidth}%` }}
          className="rounded-lg border border-[#3E3E42] overflow-hidden"
        >
          {left}
        </div>

        <div
          onMouseDown={handleHorizontalResize}
          className="w-2 cursor-col-resize hover:bg-[#3E3E42] transition-colors flex-none"
        />

        <div
          ref={rightRef}
          style={{ width: `${100 - leftWidth}%` }}
          className="flex flex-col"
        >
          <div
            style={{ height: `${topHeight}%` }}
            className="rounded-lg border border-[#3E3E42] overflow-hidden"
          >
            {query}
          </div>

          <div
            onMouseDown={handleVerticalResize}
            className="h-2 flex-none cursor-row-resize hover:bg-[#3E3E42] transition-colors"
          />

          <div
            style={{ height: `${100 - topHeight}%` }}
            className="rounded-lg border border-[#3E3E42] overflow-hidden"
          >
            {results}
          </div>
        </div>
      </div>
    </div>
  );
}