import { useSignOut } from "../hooks/useSignOut";

export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="loading-screen">
      <span className="spinner" />
      <p className="muted">{label}</p>
    </div>
  );
}

export function AccountError() {
  const signOut = useSignOut();

  return (
    <div className="loading-screen">
      <h1 className="title">Could not load your account</h1>
      <button type="button" className="text-button danger" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}
