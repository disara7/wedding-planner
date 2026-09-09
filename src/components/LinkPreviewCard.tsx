import { useState } from "react";
import { ArrowUpRight, Link as LinkIcon, Pin } from "lucide-react";
import type { PlanningItem } from "../types/planner";
import { placeholderImage } from "../lib/placeholder";
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
}

export default function LinkPreviewCard({
  item,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveNote,
  onDelete,
  onTogglePin,
}: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);

  const domain = item.domain ?? "link";
  const showImage = item.image && !imgFailed;
  const fallbackImg = placeholderImage(item.url ?? item.id);

  const open = () => {
    if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      className={`card card--link${item.pinned ? " is-pinned" : ""}`}
      onClick={open}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") open();
      }}
    >
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

      <div className="card__media">
        {item.loading ? (
          <div className="card__media-skeleton" aria-hidden />
        ) : showImage ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <img src={fallbackImg} alt="" aria-hidden />
        )}
      </div>

      <div className="card__body">
        <div className="card__source">
          {!faviconFailed && item.favicon ? (
            <img
              className="card__favicon"
              src={item.favicon}
              alt=""
              width={16}
              height={16}
              onError={() => setFaviconFailed(true)}
            />
          ) : (
            <span className="card__favicon card__favicon--fallback" aria-hidden>
              <LinkIcon size={11} strokeWidth={2.4} />
            </span>
          )}
          <span className="card__domain">{domain}</span>
        </div>

        {item.loading ? (
          <>
            <span className="card__line-skeleton card__line-skeleton--title" />
            <span className="card__line-skeleton" />
            <span className="card__line-skeleton card__line-skeleton--short" />
          </>
        ) : (
          <>
            <h3 className="card__title">{item.title || domain}</h3>
            {item.description && <p className="card__desc">{item.description}</p>}
          </>
        )}

        <div className="card__footer">
          <span className="card__url">{item.url}</span>
          <ArrowUpRight size={15} strokeWidth={2.2} className="card__extlink" />
        </div>

        {editing ? (
          <NoteEditor
            value={item.note ?? ""}
            placeholder="Love this photographer's outdoor wedding style…"
            onSave={onSaveNote}
            onCancel={onCancelEdit}
          />
        ) : (
          item.note && <p className="card__note" onClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}>{item.note}</p>
        )}
      </div>
    </article>
  );
}
