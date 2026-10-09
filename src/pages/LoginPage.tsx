import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { Grain } from "@/components/ui/Grain";
import { MiniRoute } from "@/components/network/NetworkMap";

export default function LoginPage() {
  return (
    <div className="relative min-h-[100svh] bg-paper text-mist">
      <Grain />
      <div className="grid min-h-[100svh] lg:grid-cols-[1.15fr_0.85fr]">
        <AuthVisualPanel />
        <div className="relative flex flex-col bg-white">
          <div className="h-20 overflow-hidden border-b border-white/8 bg-ink lg:hidden">
            <MiniRoute className="opacity-90" />
          </div>
          <div className="flex items-center justify-between px-6 py-5">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[13px] text-mute transition hover:text-mist"
            >
              <ArrowLeft size={14} />
              Back to site
            </Link>
          </div>
          <div className="flex flex-1 items-center px-6 py-8 sm:px-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
