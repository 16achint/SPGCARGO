import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LogOut } from "lucide-react";
import { Grain } from "@/components/ui/Grain";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { NetworkMap } from "@/components/network/NetworkMap";
import { useApp } from "@/state/AppContext";
import { ROLE_META } from "@/lib/mock";

export default function AuthSuccessPage() {
  const navigate = useNavigate();
  const { session, setSession } = useApp();

  useEffect(() => {
    if (!session) {
      navigate("/login?reason=expired", { replace: true });
    }
  }, [session, navigate]);

  if (!session) return null;

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-ink text-[#F7FAFC]">
      <Grain />
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <NetworkMap intensity="login" showLabels={false} />
      </div>
      <div className="relative flex min-h-[100svh] flex-col">
        <header className="wrap flex h-16 items-center justify-between">
          <Logo dark />
          <button
            type="button"
            onClick={() => {
              setSession(null);
              navigate("/login");
            }}
            className="inline-flex items-center gap-1.5 text-[13px] text-fog transition hover:text-white"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </header>
        <main className="wrap flex flex-1 items-center py-16">
          <div className="glass-strong max-w-lg rounded-2xl p-8">
            <p className="eyebrow">Authenticated</p>
            <h1 className="mt-3 text-[32px] font-medium tracking-tight text-mist">
              You are signed in.
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-mute">
              Welcome to CargoOS, {session.email}. Your credentials have been
              verified and this session is secure.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[12px] font-medium text-accent">
              Active as {ROLE_META[session.role].label} · {ROLE_META[session.role].home}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/app" size="lg">
                Enter CargoOS
                <ArrowRight size={16} />
              </Button>
              <Button to="/" variant="secondary" size="lg">
                Return to site
              </Button>
            </div>
            <p className="mt-4 text-[12px] text-mute-2">
              Tip: switch between Operations, Management, Customer and Vendor
              personas from the profile menu inside CargoOS.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
