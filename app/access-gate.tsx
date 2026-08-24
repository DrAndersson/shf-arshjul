"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";

const PASSWORD_HASH = "2eda9c50b4cc0278fc5f87a080ebc3b2ae8160e13caf6ef90bbd26282d2afbf3";
const SESSION_KEY = "shf-pages-authenticated";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export default function AccessGate({ children, enabled, logoSrc }: { children: ReactNode; enabled: boolean; logoSrc: string }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(!enabled);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return;
    setAuthenticated(sessionStorage.getItem(SESSION_KEY) === "1");
    setReady(true);
  }, [enabled]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valid = user.trim().toUpperCase() === "SHF" && await sha256(password) === PASSWORD_HASH;
    if (!valid) {
      setError("Fel användarnamn eller lösenord.");
      setPassword("");
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    setAuthenticated(true);
    setError("");
  }

  if (!enabled) return children;

  if (!ready || !authenticated) {
    return <main className="login-shell">
      <div className="login-orbit one"/><div className="login-orbit two"/>
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand"><img src={logoSrc} alt="Svensk Handkirurgisk Förening"/><span><b>SHF</b><small>STYRELSEPORTAL</small></span></div>
        <div className="login-copy"><span>BEHÖRIGHET KRÄVS</span><h1 id="login-title">Välkommen till<br/><em>årshjulet.</em></h1><p>Logga in för att öppna styrelsens gemensamma arbetsyta.</p></div>
        <form onSubmit={signIn}>
          <label><span>Användarnamn</span><input value={user} onChange={event => setUser(event.target.value)} autoComplete="username" required/></label>
          <label><span>Lösenord</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required/></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit">Öppna årshjulet <i>→</i></button>
        </form>
        <small className="login-foot">SVENSK HANDKIRURGISK FÖRENING · 2026</small>
      </section>
    </main>;
  }

  return <>
    {children}
    <button className="logout-button" onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthenticated(false); }} aria-label="Logga ut från SHF Årshjul">Logga ut</button>
  </>;
}
