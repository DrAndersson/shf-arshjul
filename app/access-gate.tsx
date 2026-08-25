"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AccessGate({ children, logoSrc }: { children: ReactNode; logoSrc: string }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(() => typeof window !== "undefined" && (
    window.location.hash.includes("type=invite") ||
    window.location.hash.includes("type=recovery") ||
    new URLSearchParams(window.location.search).get("type") === "invite"
  ));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthenticated(Boolean(data.session));
      if (data.session?.user.user_metadata?.password_initialized !== true) {
        setNeedsPassword(true);
      }
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (active) {
        if (
          event === "PASSWORD_RECOVERY" ||
          (event === "SIGNED_IN" && session?.user.user_metadata?.password_initialized !== true)
        ) {
          setNeedsPassword(true);
        }
        setAuthenticated(Boolean(session));
        setReady(true);
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError("Fel e-postadress eller lösenord.");
      setPassword("");
    }
  }

  async function sendPasswordSetup() {
    if (!email.trim()) {
      setError("Ange din e-postadress först.");
      return;
    }
    setSubmitting(true);
    setError("");
    setNotice("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "https://drandersson.github.io/shf-arshjul/",
    });
    setSubmitting(false);
    if (resetError) {
      setError("Kunde inte skicka länken. Kontrollera adressen och försök igen.");
      return;
    }
    setNotice("En säker länk har skickats. Kontrollera även skräpposten.");
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 10) {
      setError("Lösenordet behöver innehålla minst 10 tecken.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Lösenorden stämmer inte överens.");
      return;
    }
    setSubmitting(true);
    setError("");
    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
      data: { password_initialized: true },
    });
    setSubmitting(false);
    if (passwordError) {
      setError("Lösenordet kunde inte sparas. Öppna inbjudningslänken igen.");
      return;
    }
    window.history.replaceState({}, document.title, window.location.pathname);
    setNeedsPassword(false);
    setNewPassword("");
    setConfirmPassword("");
  }

  if (ready && authenticated && needsPassword) {
    return <main className="login-shell">
      <div className="login-orbit one"/><div className="login-orbit two"/>
      <section className="login-panel" aria-labelledby="password-title">
        <div className="login-brand"><img src={logoSrc} alt="Svensk Handkirurgisk Förening"/><span><b>SHF</b><small>STYRELSEPORTAL</small></span></div>
        <div className="login-copy"><span>AKTIVERA KONTO</span><h1 id="password-title">Välj ditt<br/><em>lösenord.</em></h1><p>Skapa ett personligt lösenord för framtida inloggningar.</p></div>
        <form onSubmit={savePassword}>
          <label><span>Nytt lösenord</span><input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} autoComplete="new-password" minLength={10} required/></label>
          <label><span>Upprepa lösenord</span><input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={10} required/></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? "Sparar…" : "Spara och öppna årshjulet"} <i>→</i></button>
        </form>
        <small className="login-foot">PERSONLIGT KONTO · SHF</small>
      </section>
    </main>;
  }

  if (!ready || !authenticated) {
    return <main className="login-shell">
      <div className="login-orbit one"/><div className="login-orbit two"/>
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand"><img src={logoSrc} alt="Svensk Handkirurgisk Förening"/><span><b>SHF</b><small>STYRELSEPORTAL</small></span></div>
        <div className="login-copy"><span>BEHÖRIGHET KRÄVS</span><h1 id="login-title">Välkommen till<br/><em>årshjulet.</em></h1><p>Logga in för att öppna styrelsens gemensamma arbetsyta.</p></div>
        <form onSubmit={signIn}>
          <label><span>E-postadress</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" required/></label>
          <label><span>Lösenord</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required/></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          {notice && <p className="login-notice" role="status">{notice}</p>}
          <button type="submit" disabled={submitting}>{submitting ? "Loggar in…" : "Öppna årshjulet"} <i>→</i></button>
          <button className="login-secondary" type="button" disabled={submitting} onClick={sendPasswordSetup}>Skapa eller återställ lösenord <i>↗</i></button>
        </form>
        <small className="login-foot">SVENSK HANDKIRURGISK FÖRENING · 2026</small>
      </section>
    </main>;
  }

  return <>
    {children}
    <button className="logout-button" onClick={() => supabase.auth.signOut()} aria-label="Logga ut från SHF Årshjul">Logga ut</button>
  </>;
}
