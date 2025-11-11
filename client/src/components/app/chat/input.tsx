import { useRef, useEffect, type FC, type JSX, type KeyboardEvent } from "react";

interface EditableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const EditableInput: FC<EditableInputProps> = ({
  value,
  onChange,
  placeholder,
}): JSX.Element => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Only update text when necessary (prevents caret reset)
    if (el.innerText !== value) el.innerText = value;
  }, [value]);

  const handleInput = (): void => {
    if (ref.current) {
      onChange(ref.current.innerText);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertLineBreak");
    }
  };

  return (
    <div
      ref={ref}
      className="in_chat_footer_input_field"
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
    ></div>
  );
};

export default EditableInput;
