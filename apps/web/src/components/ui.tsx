import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "amber" | "onDark" | "onDarkGhost";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-ink-inverse hover:bg-ink/90 focus-visible:outline-amber",
  amber:
    "bg-amber text-ink-inverse hover:bg-amber-soft focus-visible:outline-amber-soft",
  secondary:
    "bg-transparent text-ink border border-hairline-dark hover:border-amber/60 focus-visible:outline-amber",
  ghost:
    "bg-transparent text-ink-muted hover:text-ink hover:bg-white/5 focus-visible:outline-amber",
  onDark:
    "bg-ink text-ink-inverse hover:bg-ink/90 focus-visible:outline-amber",
  onDarkGhost:
    "bg-transparent text-ink border border-hairline-dark hover:border-amber/50 focus-visible:outline-amber",
};

export function Button({
  variant = "amber",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-tight transition will-change-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        buttonStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {hint && !error ? <span className="text-ink-muted">{hint}</span> : null}
      {error ? <span className="text-amber">{error}</span> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-amber",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "w-full min-h-32 rounded-2xl border border-hairline bg-surface px-4 py-3 text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-amber",
        props.className,
      )}
    />
  );
}

export function Panel({
  children,
  className,
  dark = false,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      {...rest}
      className={cx(
        "rounded-2xl border p-6 md:p-8",
        dark
          ? "border-hairline-dark bg-surface-2 text-ink shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          : "border-hairline bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StateBlock({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline px-5 py-8 text-center">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx("animate-pulse rounded-lg bg-surface-2", className)}
      aria-hidden
    />
  );
}
