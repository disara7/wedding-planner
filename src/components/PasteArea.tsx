import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
} from "react";
import { Plus, ImagePlus, Link2 } from "lucide-react";
import { isProbablyUrl } from "../lib/getLinkPreview";

export interface PasteAreaHandle {
  focus: () => void;
}

interface Props {
  categoryLabel: string;
  onAddLink: (url: string) => void;
  onAddImage: (dataUrl: string) => void;
}

const SERVICES = ["Facebook", "Instagram", "Google Sheets", "Pinterest", "Websites"];
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const PasteArea = forwardRef<PasteAreaHandle, Props>(function PasteArea(
  { categoryLabel, onAddLink, onAddImage },
  ref
) {
  const [value, setValue] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current?.focus();
    },
  }));

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("That file type isn't supported — try an image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is a little large. Try one under 6 MB.");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onAddImage(dataUrl);
      setError(null);
    } catch {
      setError("Couldn't read that image. Please try again.");
    }
  };

  const submitText = (raw: string) => {
    const text = raw.trim();
    if (!text) {
      inputRef.current?.focus();
      return;
    }
    if (isProbablyUrl(text)) {
      onAddLink(text);
      setValue("");
      setError(null);
    } else {
      setError("That doesn't look like a link. Paste a URL, or drop an image.");
    }
  };

  const onPaste = async (e: ClipboardEvent) => {
    const imageItem = Array.from(e.clipboardData.items).find((i) =>
      i.type.startsWith("image/")
    );
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) await handleImageFile(file);
      return;
    }
    const text = e.clipboardData.getData("text");
    if (text && isProbablyUrl(text)) {
      e.preventDefault();
      onAddLink(text);
      setValue("");
      setError(null);
    }
  };

  const onDrop = async (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = Array.from(e.dataTransfer.files).find((f) =>
      f.type.startsWith("image/")
    );
    if (file) {
      await handleImageFile(file);
      return;
    }
    const text = e.dataTransfer.getData("text");
    if (text && isProbablyUrl(text)) onAddLink(text);
  };

  return (
    <section
      className={`pastearea${dragging ? " is-dragging" : ""}`}
      onClick={() => inputRef.current?.focus()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragging(false);
      }}
      onDrop={onDrop}
    >
      <div className="pastearea__icon" aria-hidden>
        <Link2 size={18} strokeWidth={2} />
      </div>

      <div className="pastearea__field">
        <input
          ref={inputRef}
          className="pastearea__input"
          type="text"
          inputMode="url"
          value={value}
          placeholder="Paste a link or drop a screenshot here"
          aria-label={`Add a link or screenshot to ${categoryLabel}`}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onPaste={onPaste}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitText(value);
            }
          }}
        />
        <p className="pastearea__hint">{SERVICES.join("  •  ")}</p>
      </div>

      <div className="pastearea__actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus size={16} strokeWidth={2} />
          <span className="pastearea__upload-label">Upload image</span>
        </button>
        <button type="button" className="btn btn--primary" onClick={() => submitText(value)}>
          <Plus size={16} strokeWidth={2.4} />
          Add item
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await handleImageFile(file);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="pastearea__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
});

export default PasteArea;
