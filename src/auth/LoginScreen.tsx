import { useState, type FormEvent } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { ApiError } from "../lib/api";
import GoogleButton from "./GoogleButton";

type Mode = "login" | "signup";

export default function LoginScreen() {
  const { login, register, loginWithGoogle, googleClientId } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    setError(null);
    setBusy(true);
    try {
      await loginWithGoogle(credential);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand">
          <span className="auth__brand-mark" aria-hidden>
            <Heart size={18} strokeWidth={2.4} />
          </span>
          <span>Wedding Planner</span>
        </div>

        <h1 className="auth__title">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="auth__subtitle">
          {mode === "login"
            ? "Sign in to open your planning artboard."
            : "Start collecting everything for your wedding in one place."}
        </p>

        {googleClientId ? (
          <>
            <GoogleButton
              clientId={googleClientId}
              onCredential={handleGoogle}
              onError={setError}
            />
            <div className="auth__divider">
              <span>or</span>
            </div>
          </>
        ) : (
          <p className="auth__hint">
            Google sign-in isn’t configured. Set <code>GOOGLE_CLIENT_ID</code> to enable it.
          </p>
        )}

        <form className="auth__form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="auth__label">
              Name
              <input
                className="auth__input"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex & Sam"
              />
            </label>
          )}

          <label className="auth__label">
            Email
            <input
              className="auth__input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="auth__label">
            Password
            <input
              className="auth__input"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            />
          </label>

          {error && (
            <p className="auth__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--primary auth__submit" disabled={busy}>
            {busy && <Loader2 size={16} className="spin" />}
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="auth__switch">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button type="button" onClick={() => switchMode("signup")}>
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => switchMode("login")}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
