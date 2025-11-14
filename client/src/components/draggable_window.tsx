import { useChatProvider } from "@/constants/providers/chatProvider";
import React, { useRef, useState, useEffect, type ReactNode } from "react";
import { BiWindows } from "react-icons/bi";
import { MdClose, MdFullscreen, MdOutlineMinimize } from "react-icons/md";

interface DraggableProps {
  header?: string;
  icon?: ReactNode;
  bubbleContent?: ReactNode;
  children?: ReactNode;
  minWidth?: number;
  minHeight?: number;
}

const Draggable: React.FC<DraggableProps> = ({
  header = "Window",
  icon,
  bubbleContent,
  children,
  minWidth,
  minHeight
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: minWidth||600, height: minHeight||450 });
  const { activeColor } = useChatProvider();

  const MIN_WIDTH = minWidth || 600;
  const MIN_HEIGHT = minHeight || 450;

  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0, left: 0, top: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    setIsDragging(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      left: position.x,
      top: position.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isFullscreen) return;
    const touch = e.touches[0];
    setIsDragging(true);
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      width: size.width,
      height: size.height,
      left: position.x,
      top: position.y,
    };
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeDir(direction);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      left: position.x,
      top: position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;

      const newX = startPos.current.left + dx;
      const newY = startPos.current.top + dy;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const elWidth = size.width;
      const elHeight = size.height;

      // clamp drag within screen
      const clampedX = Math.min(Math.max(0, newX), windowWidth - elWidth);
      const clampedY = Math.min(Math.max(0, newY), windowHeight - elHeight);

      setPosition({ x: clampedX, y: clampedY });
    }
    else if (isResizing && resizeDir) {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;

      let newWidth = startPos.current.width;
      let newHeight = startPos.current.height;
      let newLeft = startPos.current.left;
      let newTop = startPos.current.top;

      if (resizeDir.includes("right")) newWidth = startPos.current.width + dx;
      if (resizeDir.includes("bottom")) newHeight = startPos.current.height + dy;
      if (resizeDir.includes("left")) {
        newWidth = startPos.current.width - dx;
        newLeft = startPos.current.left + dx;
      }
      if (resizeDir.includes("top")) {
        newHeight = startPos.current.height - dy;
        newTop = startPos.current.top + dy;
      }

      // enforce minimum size
      newWidth = Math.max(MIN_WIDTH, newWidth);
      newHeight = Math.max(MIN_HEIGHT, newHeight);

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // clamp resizing within screen edges
      if (newLeft < 0) {
        newWidth += newLeft; // reduce width when crossing left
        newLeft = 0;
      }
      if (newTop < 0) {
        newHeight += newTop; // reduce height when crossing top
        newTop = 0;
      }
      if (newLeft + newWidth > windowWidth) {
        newWidth = windowWidth - newLeft;
      }
      if (newTop + newHeight > windowHeight) {
        newHeight = windowHeight - newTop;
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newLeft, y: newTop });
    }
  };


  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDir(null);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  if (isMinimized)
    return (
      <div
        onClick={toggleMinimize}
        onMouseDown={handleDragStart}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 100,
          height: 40,
          borderRadius: "1rem",
          background: "var(--app-accent)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 5,
        }}
      >
        {bubbleContent || "💬"}
      </div>
    );

  const resizeHandles = [
    "top",
    "right",
    "bottom",
    "left",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ];

  const getCursor = (dir: string) => {
    if (dir === "top" || dir === "bottom") return "ns-resize";
    if (dir === "left" || dir === "right") return "ew-resize";
    if (dir === "top-left" || dir === "bottom-right") return "nwse-resize";
    return "nesw-resize";
  };

  return (
    <div
      style={{
        position: "fixed",
        left: isFullscreen ? 0 : position.x,
        top: isFullscreen ? 0 : position.y,
        width: isFullscreen ? "100vw" : size.width,
        height: isFullscreen ? "100vh" : size.height,
        background: activeColor.background,
        color: activeColor.text,
        borderRadius: isFullscreen ? 0 : "0.5rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
        style={{
          cursor: isFullscreen ? "default" : "move",
          background: "var(--app-accent)",
          color: "white",
          fontFamily: "Quicksand, sans-serif",
          fontWeight: 700,
          fontSize: "0.75rem",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span>{header}</span>
        </div>
        <div style={{ display: "flex", marginLeft: "auto", gap: 8 }}>
          <button onClick={toggleMinimize}>
            <MdOutlineMinimize size={17} />
          </button>
          <button onClick={toggleFullscreen}>
            {isFullscreen ? <BiWindows size={17} /> : <MdFullscreen size={17} />}
          </button>
          <button onClick={() => setIsMinimized(true)}>
            <MdClose size={17} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {children}
      </div>

      {/* Resize Handles */}
      {resizeHandles.map((dir) => {
        const styles: React.CSSProperties = {
          position: "absolute",
          cursor: getCursor(dir),
          zIndex: 10,
          background: "transparent",
        };

        if (dir.includes("top")) styles.top = -3;
        if (dir.includes("bottom")) styles.bottom = -3;
        if (dir.includes("left")) styles.left = -3;
        if (dir.includes("right")) styles.right = -3;

        if (dir.includes("-")) {
          styles.width = 10;
          styles.height = 10;
        } else if (dir === "top" || dir === "bottom") {
          styles.height = 6;
          styles.left = 6;
          styles.right = 6;
        } else {
          styles.width = 6;
          styles.top = 6;
          styles.bottom = 6;
        }

        return (
          <div
            key={dir}
            style={styles}
            onMouseDown={(e) => handleResizeStart(e, dir)}
          />
        );
      })}
    </div>
  );
};

export default Draggable;
