"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AccessGate({ children, logoSrc }: { children: ReactNode; logoSrc: string }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthenticated(Boolean(data.session));
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
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
          <button type="submit" disabled={submitting}>{submitting ? "Loggar in…" : "Öppna årshjulet"} <i>→</i></button>
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
