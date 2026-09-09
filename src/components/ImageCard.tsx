import { Pin, Plus } from "lucide-react";
import type { PlanningItem } from "../types/planner";
import CardMenu from "./CardMenu";
import NoteEditor from "./NoteEditor";

interface Props {
  item: PlanningItem;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveNote: (note: string) => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onOpenImage: () => void;
}

export default function ImageCard({
  item,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveNote,
  onDelete,
  onTogglePin,
  onOpenImage,
}: Props) {
  return (
    <article className={`card card--image${item.pinned ? " is-pinned" : ""}`}>
      {item.pinned && (
        <span className="card__pin" aria-label="Pinned">
          <Pin size={12} strokeWidth={2.4} />
        </span>
      )}
      <CardMenu
        pinned={item.pinned}
        onEdit={onStartEdit}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
      />

      <button type="button" className="card__image-btn" onClick={onOpenImage} aria-label="Open larger preview">
        <img src={item.image} alt={item.title || "Saved screenshot"} loading="lazy" />
      </button>

      <div className="card__body">
        {item.title && <h3 className="card__title">{item.title}</h3>}

        {editing ? (
          <NoteEditor
            value={item.note ?? ""}
            placeholder="Add a note about this image…"
            onSave={onSaveNote}
            onCancel={onCancelEdit}
          />
        ) : item.note ? (
          <p className="card__note" onClick={onStartEdit}>
            {item.note}
          </p>
        ) : (
          <button type="button" className="card__add-note" onClick={onStartEdit}>
            <Plus size={13} strokeWidth={2.4} />
            Add a note
          </button>
        )}
      </div>
    </article>
  );
}
