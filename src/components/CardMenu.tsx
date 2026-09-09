import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Pin, PinOff } from "lucide-react";

interface Props {
  pinned?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

export default function CardMenu({ pinned, onEdit, onDelete, onTogglePin }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="cardmenu" ref={ref}>
      <button
        type="button"
        className="icon-btn icon-btn--oncard"
        aria-label="Card options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <MoreHorizontal size={16} strokeWidth={2.2} />
      </button>

      {open && (
        <div className="menu menu--card" role="menu" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            role="menuitem"
            className="menu__item"
            onClick={() => {
              onTogglePin();
              setOpen(false);
            }}
          >
            {pinned ? <PinOff size={15} strokeWidth={2} /> : <Pin size={15} strokeWidth={2} />}
            {pinned ? "Unpin" : "Pin to top"}
          </button>
          <button
            type="button"
            role="menuitem"
            className="menu__item"
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
          >
            <Pencil size={15} strokeWidth={2} />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            className="menu__item menu__item--danger"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            <Trash2 size={15} strokeWidth={2} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
