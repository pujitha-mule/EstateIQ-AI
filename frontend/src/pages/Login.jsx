
import React, { useState } from "react";
import { Building2, LockKeyhole, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await login({
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(
        err.message || "Unable to sign in. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white border border-[#E7EDF4] rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#B9F5D0] flex items-center justify-center text-[#142B46]">
            <Building2 size={32} />
          </div>

          <h1 className="text-2xl font-bold text-[#142B46]">
            EstateIQ AI
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Every enquiry matters. Every visit counts.
          </p>
        </div>

        {/* Login heading */}
        <h2 className="text-xl font-bold text-[#142B46]">
          Welcome back
        </h2>

        <p className="text-sm text-slate-500 mt-1 mb-6">
          Sign in to your sales workspace.
        </p>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex gap-2 text-sm"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            autoComplete="username"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full py-3"
            disabled={loading}
          >
            <LockKeyhole size={17} />

            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-xs text-slate-400 text-center mt-7">
          Secure access for authorised EstateIQ AI team members.
        </p>
      </section>
    </main>
  );
}
