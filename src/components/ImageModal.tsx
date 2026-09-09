import { useEffect } from "react";
import { X } from "lucide-react";
import type { PlanningItem } from "../types/planner";

interface Props {
  item: PlanningItem | null;
  onClose: () => void;
}

export default function ImageModal({ item, onClose }: Props) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={item.title || "Image preview"} onClick={onClose}>
      <button type="button" className="modal__close" aria-label="Close preview" onClick={onClose}>
        <X size={20} strokeWidth={2.2} />
      </button>
      <figure className="modal__figure" onClick={(e) => e.stopPropagation()}>
        <img src={item.image} alt={item.title || "Saved screenshot"} />
        {(item.title || item.note) && (
          <figcaption className="modal__caption">
            {item.title && <strong>{item.title}</strong>}
            {item.note && <span>{item.note}</span>}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
