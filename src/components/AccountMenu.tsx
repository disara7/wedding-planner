import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import type { AuthUser } from "../lib/api";

interface Props {
  user: AuthUser;
  onLogout: () => void;
}

function initials(user: AuthUser): string {
  const source = user.name?.trim() || user.email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export default function AccountMenu({ user, onLogout }: Props) {
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
    <div className="account" ref={ref}>
      <button
        type="button"
        className="account__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="account__avatar" aria-hidden>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span>{initials(user).toUpperCase() || "?"}</span>
          )}
        </span>
        <span className="account__meta">
          <span className="account__name">{user.name || "Your account"}</span>
          <span className="account__email">{user.email}</span>
        </span>
      </button>

      {open && (
        <div className="menu menu--account" role="menu">
          <button
            type="button"
            role="menuitem"
            className="menu__item menu__item--danger"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <LogOut size={15} strokeWidth={2} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
