import { Plus } from "lucide-react";
import CategoryIcon from "./CategoryIcon";

interface Props {
  icon: string;
  onAddFirst: () => void;
}

export default function EmptyState({ icon, onAddFirst }: Props) {
  return (
    <div className="empty">
      <span className="empty__icon" aria-hidden>
        <CategoryIcon name={icon} size={26} strokeWidth={1.6} />
      </span>
      <h2 className="empty__title">Nothing here yet</h2>
      <p className="empty__text">
        Paste a link or screenshot to start collecting ideas.
      </p>
      <button type="button" className="btn btn--primary" onClick={onAddFirst}>
        <Plus size={16} strokeWidth={2.4} />
        Add your first item
      </button>
    </div>
  );
}
