import { useState } from "react";
import type { PlanningItem } from "../types/planner";
import LinkPreviewCard from "./LinkPreviewCard";
import ImageCard from "./ImageCard";

interface Props {
  item: PlanningItem;
  onSaveNote: (id: string, note: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onOpenImage: (item: PlanningItem) => void;
}

/**
 * Thin dispatcher: owns the per-card "editing note" state and forwards
 * everything else to the right card renderer.
 */
export default function PlanningCard({
  item,
  onSaveNote,
  onDelete,
  onTogglePin,
  onOpenImage,
}: Props) {
  const [editing, setEditing] = useState(false);

  const shared = {
    item,
    editing,
    onStartEdit: () => setEditing(true),
    onCancelEdit: () => setEditing(false),
    onSaveNote: (note: string) => {
      onSaveNote(item.id, note);
      setEditing(false);
    },
    onDelete: () => onDelete(item.id),
    onTogglePin: () => onTogglePin(item.id),
  };

  if (item.type === "image") {
    return <ImageCard {...shared} onOpenImage={() => onOpenImage(item)} />;
  }
  return <LinkPreviewCard {...shared} />;
}
