type PrimaryButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: "primary" | "danger" | "quiet";
};

export function PrimaryButton({
  label,
  onClick,
  disabled = false,
  loading = false,
  tone = "primary",
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      className={`primary-button tone-${tone}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <span className={`spinner small ${tone === "quiet" ? "" : "on-primary"}`} /> : label}
    </button>
  );
}
