import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let scriptPromise: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("gsi load failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("gsi load failed"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

interface Props {
  clientId: string;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}

export default function GoogleButton({ clientId, onCredential, onError }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !holderRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
        });
        holderRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(holderRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
          width: holderRef.current.offsetWidth || 320,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        onError("Couldn't load Google sign-in. Check your connection and try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential, onError]);

  if (failed) {
    return (
      <button
        type="button"
        className="btn btn--ghost auth__google-fallback"
        onClick={() => window.location.reload()}
      >
        Retry Google sign-in
      </button>
    );
  }

  return <div ref={holderRef} className="auth__google" aria-label="Continue with Google" />;
}
