import { useMemo, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FormField } from "./FormField";
import { PasswordInput } from "./PasswordInput";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useApp } from "@/state/AppContext";
import { ROLE_USERS } from "@/lib/mock";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEMO_EMAIL = "marco.r@example.org";
const DEMO_PASSWORD = "CargoOS2026!";

type FormError = {
  email?: string;
  password?: string;
  banner?: { kind: "error" | "warn" | "info"; text: string };
};

export function LoginForm() {
  const navigate = useNavigate();
  const { setSession } = useApp();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<FormError["banner"]>(() => {
    if (params.get("reason") === "expired") {
      return {
        kind: "warn",
        text: "Your session has expired. Please sign in again.",
      };
    }
    return undefined;
  });

  const fieldErrors = useMemo(() => {
    const next: FormError = {};
    const showEmail = touched.email || submitted;
    const showPass = touched.password || submitted;
    if (showEmail) {
      if (!email.trim()) next.email = "Email cannot be empty.";
      else if (!EMAIL_RE.test(email.trim()))
        next.email = "Enter a valid work email address.";
    }
    if (showPass && !password) next.password = "Password cannot be empty.";
    return next;
  }, [email, password, touched, submitted]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setBanner(undefined);

    const emailEmpty = !email.trim();
    const emailInvalid = !EMAIL_RE.test(email.trim());
    const passEmpty = !password;
    if (emailEmpty || emailInvalid || passEmpty) return;

    setLoading(true);
    try {
      await wait(1200);
      const normalized = email.trim().toLowerCase();

      if (normalized === "neterr@spgcargoos.com") {
        setBanner({
          kind: "error",
          text: "Network error. Check your connection and try again.",
        });
        return;
      }
      if (normalized === "disabled@spgcargoos.com") {
        setBanner({
          kind: "warn",
          text: "This account is disabled. Contact your CargoOS administrator.",
        });
        return;
      }
      if (normalized !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
        setBanner({
          kind: "error",
          text: "Incorrect email or password.",
        });
        return;
      }

      if (remember) {
        localStorage.setItem("spg.remember", normalized);
      } else {
        localStorage.removeItem("spg.remember");
      }
      setSession({
        email: normalized,
        name: ROLE_USERS.operations.name,
        role: "operations",
      });
      navigate("/auth-success", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setTouched({ email: true, password: true });
    setBanner(undefined);
  }

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="mb-8 lg:hidden">
        <Logo />
      </div>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 text-[28px] font-medium tracking-tight text-mist">
        Sign in to CargoOS
      </h1>
      <p className="mt-2 text-[14px] text-mute">Access your logistics workspace.</p>

      {banner && (
        <div
          role="alert"
          className={
            banner.kind === "warn"
              ? "mt-5 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2.5 text-[13px] text-warn"
              : banner.kind === "info"
                ? "mt-5 rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-2.5 text-[13px] text-cyan"
                : "mt-5 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2.5 text-[13px] text-bad"
          }
        >
          {banner.text}
        </div>
      )}

      <form className="mt-7 space-y-4" onSubmit={onSubmit} noValidate>
        <FormField
          id="email"
          label="Work Email"
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={email}
          placeholder="nina.v@example.com"
          error={fieldErrors.email}
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        />
        <FormField
          id="password"
          label="Password"
          error={fieldErrors.password}
        >
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={Boolean(fieldErrors.password)}
            disabled={loading}
          />
        </FormField>

        <div className="flex items-center justify-between pt-1">
          <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-mute">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-ink/20 bg-white accent-accent"
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-[13px] text-cyan transition hover:text-cyan-2"
            onClick={() =>
              setBanner({
                kind: "info",
                text: "Password resets are issued by your CargoOS administrator.",
              })
            }
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          className="mt-2 w-full"
          size="lg"
          loading={loading}
          aria-busy={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-[13px] text-mute">
        Need access? Contact your CargoOS administrator.
      </p>
      <button
        type="button"
        onClick={fillDemo}
        className="mt-3 text-[12px] text-mute-2 underline-offset-4 transition hover:text-mist hover:underline"
      >
        Use demo workspace
      </button>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
