import { type CSSProperties, useEffect, useRef, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import useOutsideClick from "./outside_click";
import type { IDLABELVALUE } from "@/constants/types";
import { useChatProvider } from "@/constants/providers/chatProvider";

export interface DropdownItem extends IDLABELVALUE {
  label: string;
  value: string;
}

interface DropdownProps {
  title?: string;
  data: DropdownItem[];
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  style?: CSSProperties;
  cStyle?: CSSProperties;
  selectedValue?: string;
  onSelect?: (value: string, label?: string) => void;
}

const Dropdown = ({
  title = "Select",
  data,
  position = "top-right",
  style = {},
  cStyle = {},
  selectedValue,
  onSelect,
}: DropdownProps) => {
  const { activeColor } = useChatProvider();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DropdownItem | undefined>();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const rotateStyle: CSSProperties = {
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.4s ease",
  };

  const dropdownPosition: CSSProperties = {
    position: "absolute",
    background: activeColor.background,
    width: "max-content",
    maxHeight: "13rem",
    overflowY: "auto",
    padding: "0.75rem 0",
    borderRadius: "0.4rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    zIndex: 20,
    ...(position === "bottom-right" && { top: "100%", right: 0, marginTop: "0.5rem" }),
    ...(position === "bottom-left" && { top: "100%", left: 0, marginTop: "0.5rem" }),
    ...(position === "top-right" && { bottom: "100%", right: 0, marginBottom: "0.5rem" }),
    ...(position === "top-left" && { bottom: "100%", left: 0, marginBottom: "0.5rem" }),
  };

  const buttonStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "10px 16px",
    borderRadius: "8px",
    background: activeColor.background,
    border: "0.5px solid " + activeColor.fadedBorder,
    fontSize: "12px",
    color: activeColor.textFade,
    cursor: "pointer",
    ...style,
  };

  useOutsideClick({
    ref: dropdownRef,
    handler: () => setIsOpen(false),
  });

  useEffect(() => {
    if (selectedValue) {
      setSelectedItem(data.find((d) => d.value === selectedValue));
    } else {
      setSelectedItem(undefined);
    }
  }, [selectedValue, data]);

  return (
    <div ref={dropdownRef} style={{ position: "relative", ...cStyle }}>
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        style={buttonStyle}
      >
        <span>{selectedItem?.label || title}</span>
        <GoChevronDown size={20} style={rotateStyle} />
      </button>

      {isOpen && (
        <div aria-label="Dropdown menu" style={dropdownPosition}>
          <ul role="menu" style={{ overflowY: "auto", maxHeight: "10rem" }}>
            {data.map((item) => {
              const active = selectedItem?.value === item.value;

              return (
                <li
                  key={item.value}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsOpen(false);
                    onSelect?.(item.value, item.label);
                  }}
                  style={{
                    padding: "10px 40px 10px 20px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "12px",
                    cursor: "pointer",
                    background: active
                      ? activeColor.fadeBackground
                      : activeColor.background,
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = (activeColor.text) as string)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = active
                      ? (activeColor.fadeBackground) as string
                      : (activeColor.background) as string
                    )
                  }
                >
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
