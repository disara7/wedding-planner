import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  placeholder?: string;
  onSave: (note: string) => void;
  onCancel: () => void;
}

export default function NoteEditor({ value, placeholder, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.setSelectionRange(draft.length, draft.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="noteeditor" onClick={(e) => e.stopPropagation()}>
      <textarea
        ref={ref}
        className="noteeditor__area"
        rows={3}
        value={draft}
        placeholder={placeholder ?? "Add a short note…"}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSave(draft.trim());
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="noteeditor__actions">
        <button type="button" className="btn btn--tiny btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn--tiny btn--primary"
          onClick={() => onSave(draft.trim())}
        >
          Save note
        </button>
      </div>
    </div>
  );
}
