"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "Alla" | "Ordförande" | "Vetenskaplig sekreterare" | "Kassör" | "Utbildningsansvarig" | "IT-ansvarig" | "Sekreterare" | "Övrig ledamot";
type Status = "Att göra" | "Pågår" | "Klart";
type Task = {
  id: string;
  title: string;
  month: number;
  day?: number;
  role: Exclude<Role, "Alla">;
  category: "Årsmöte" | "Ekonomi" | "Styrelse" | "Medlemmar" | "Utbildning" | "Kommunikation" | "Omvärld";
  description: string;
  checklist: string[];
  meeting?: boolean;
};

const roles: { name: Role; short: string; tone: string }[] = [
  { name: "Alla", short: "Översikt", tone: "#162b27" },
  { name: "Ordförande", short: "OR", tone: "#e95d3f" },
  { name: "Vetenskaplig sekreterare", short: "VS", tone: "#7052b8" },
  { name: "Kassör", short: "KA", tone: "#2c7d6f" },
  { name: "Utbildningsansvarig", short: "UT", tone: "#ce8a24" },
  { name: "IT-ansvarig", short: "IT", tone: "#3979a8" },
  { name: "Sekreterare", short: "SE", tone: "#9f665c" },
  { name: "Övrig ledamot", short: "ÖL", tone: "#607267" },
];

const months = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
const categories: Task["category"][] = ["Årsmöte", "Ekonomi", "Styrelse", "Medlemmar", "Utbildning", "Kommunikation", "Omvärld"];
const years = [2024, 2025, 2026, 2027, 2028, 2029];

const tasks: Task[] = [
  { id: "jan-st", title: "SOF:s ST-skola", month: 0, day: 18, role: "Utbildningsansvarig", category: "Utbildning", description: "Följ upp handkirurgins del i ST-skolan och stäm av med kursledning och studierektorer.", checklist: ["Bekräfta kontaktperson", "Stäm av innehåll", "Samla återkoppling"] },
  { id: "feb-internat", title: "Styrelseinternat i Sigtuna", month: 1, day: 12, role: "Ordförande", category: "Styrelse", description: "Kalla till och leda årets internat. Sätt riktning, beslutspunkter och prioriteringar.", checklist: ["Skicka kallelse", "Förankra agenda", "Fördela förberedelser"], meeting: true },
  { id: "feb-assh", title: "ASSH-inbetalning", month: 1, day: 28, role: "Kassör", category: "Ekonomi", description: "Kontrollera underlag, attest och genomför årets inbetalning.", checklist: ["Kontrollera faktura", "Attest", "Bokför betalning"] },
  { id: "mar-fessh", title: "FESSH: avgift & representation", month: 2, day: 20, role: "Ordförande", category: "Omvärld", description: "Säkra betalning, delegatfrågor och relevant återkoppling till styrelsen.", checklist: ["Kontrollera medlemsavgift", "Stäm av delegat", "Rapportera till styrelsen"] },
  { id: "mar-abstract", title: "Öppna abstracthantering", month: 2, day: 25, role: "Vetenskaplig sekreterare", category: "Årsmöte", description: "Förbered mottagning, bedömning och urval av abstracts till det vetenskapliga mötet.", checklist: ["Publicera instruktion", "Bekräfta bedömargrupp", "Sätt bedömningsdatum"] },
  { id: "apr-sls", title: "SLS: motioner & inbetalning", month: 3, day: 15, role: "Vetenskaplig sekreterare", category: "Omvärld", description: "Bevaka motioner, ordföranderåd och föreningens åtaganden mot SLS.", checklist: ["Läs inkomna motioner", "Förbered ställningstagande", "Återkoppla till styrelsen"] },
  { id: "apr-dekl", title: "Deklaration", month: 3, day: 30, role: "Kassör", category: "Ekonomi", description: "Färdigställ deklarationsunderlag och arkivera signerad version.", checklist: ["Stäm av bokföring", "Färdigställ underlag", "Arkivera kvittens"] },
  { id: "may-invite", title: "Årsmötesinbjudan", month: 4, day: 5, role: "IT-ansvarig", category: "Kommunikation", description: "Publicera inbjudan, programöversikt och anmälningslänk på hemsidan.", checklist: ["Kvalitetssäkra text", "Publicera nyhet", "Testa länkar"] },
  { id: "may-sigtuna", title: "Sigtuna: bokning & deltagare", month: 4, day: 15, role: "Kassör", category: "Årsmöte", description: "Stäm av lokaler, middag, boende och deltagarlista mot betalda avgifter.", checklist: ["Bekräfta lokal", "Kontrollera deltagarlista", "Boka onsdagsmiddag"] },
  { id: "jun-register", title: "Medlemsregister: vårstädning", month: 5, day: 1, role: "Övrig ledamot", category: "Medlemmar", description: "Kontrollera medlemsregistret i Salesforce och följ upp ofullständiga poster.", checklist: ["Kontrollera nya ansökningar", "Rensa dubbletter", "Stäm av kontaktuppgifter"] },
  { id: "jun-deadline", title: "Sista anmälan till årsmötet", month: 5, day: 1, role: "Kassör", category: "Årsmöte", description: "Stäng ordinarie anmälan och skicka sammanställning till planeringsgruppen.", checklist: ["Exportera deltagarlista", "Stäm av betalningar", "Meddela Sigtunastiftelsen"] },
  { id: "jun-prog", title: "Lås vetenskapligt program", month: 5, day: 16, role: "Vetenskaplig sekreterare", category: "Årsmöte", description: "Detaljplanera programmet, hantera abstracts och bekräfta inbjudna gäster.", checklist: ["Slutför abstracturval", "Bekräfta föreläsare", "Lämna program till webb"] },
  { id: "jul-web", title: "Sommaröversyn av hemsidan", month: 6, day: 8, role: "IT-ansvarig", category: "Kommunikation", description: "Kontrollera att kontaktuppgifter, dokument och årsmötesinformation är aktuella.", checklist: ["Kontrollera startsida", "Kontrollera styrelsesida", "Arkivera gamla dokument"] },
  { id: "aug-revision", title: "Årsredovisning till revisorerna", month: 7, day: 5, role: "Kassör", category: "Ekonomi", description: "Slutför årsredovisning och skicka komplett material till revisorerna inför årsmötet.", checklist: ["Stäm av balans", "Samla bilagor", "Skicka till revisorer"] },
  { id: "aug-berattelse", title: "Färdigställ verksamhetsberättelsen", month: 7, day: 12, role: "Ordförande", category: "Styrelse", description: "Sammanfatta årets beslut, aktiviteter och resultat för årsmötet.", checklist: ["Samla rollbidrag", "Redigera helheten", "Skicka för styrelsegodkännande"] },
  { id: "aug-agenda", title: "Dagordning & årsmötesprotokoll", month: 7, day: 20, role: "Sekreterare", category: "Årsmöte", description: "Förbered dagordning, protokollmall, röstlängd och beslutsrubriker.", checklist: ["Förbered protokollmall", "Kontrollera stadgepunkter", "Lägg in beslutsförslag"] },
  { id: "aug-meeting", title: "Vetenskapligt möte & årsmöte", month: 7, day: 27, role: "Ordförande", category: "Årsmöte", description: "Led årsmötet och säkra att beslut, ansvar och nästa steg dokumenteras.", checklist: ["Öppna mötet", "Led beslutsärenden", "Bekräfta ansvar efter mötet"], meeting: true },
  { id: "sep-minutes", title: "Justera & publicera protokoll", month: 8, day: 8, role: "Sekreterare", category: "Styrelse", description: "Färdigställ årsmötesprotokollet, inhämta justering och lämna till publicering.", checklist: ["Bearbeta anteckningar", "Inhämta justering", "Lämna till IT-ansvarig"] },
  { id: "sep-functions", title: "Rapportera valda funktionärer", month: 8, day: 20, role: "Sekreterare", category: "Medlemmar", description: "Rapportera aktuella funktionärer till SLS och Sveriges läkarförbund.", checklist: ["Sammanställ roller", "Skicka till SLS", "Skicka till Läkarförbundet"] },
  { id: "oct-ifssh", title: "IFSSH-inbetalning", month: 9, day: 10, role: "Kassör", category: "Ekonomi", description: "Kontrollera avgift, genomför betalning och arkivera underlag.", checklist: ["Kontrollera underlag", "Betala", "Bokför"] },
  { id: "oct-sk", title: "Behovsanalys för SK-kurser", month: 9, day: 24, role: "Utbildningsansvarig", category: "Utbildning", description: "Sammanställ årets behovsanalys till Socialstyrelsen och stäm av med ST-studierektorer.", checklist: ["Samla klinikernas behov", "Sammanställ analys", "Skicka till Socialstyrelsen"] },
  { id: "nov-sls-reg", title: "Medlemsregister till SLS", month: 10, day: 1, role: "Övrig ledamot", category: "Medlemmar", description: "Lämna årets medlemsregister till SLS enligt föreningens stadgar.", checklist: ["Lås register per 1 september", "Kvalitetskontroll", "Bekräfta mottagande"] },
  { id: "nov-budget", title: "Budget för nästa verksamhetsår", month: 10, day: 18, role: "Kassör", category: "Ekonomi", description: "Uppdatera prognos, föreslå budget och lyft eventuellt behov av ändrad medlemsavgift.", checklist: ["Uppdatera prognos", "Ta fram budgetförslag", "Förankra i styrelsen"] },
  { id: "dec-story", title: "Publicera årets berättelser", month: 11, day: 5, role: "IT-ansvarig", category: "Kommunikation", description: "Publicera reseberättelser, årets dokument och en kort återblick på föreningens arbete.", checklist: ["Samla reseberättelser", "Publicera dokument", "Kontrollera tillgänglighet"] },
];

const roleSummary: Record<Exclude<Role, "Alla">, string> = {
  "Ordförande": "Leder styrelsen, representerar SHF och håller ihop verksamhetsberättelse och årsmöte.",
  "Vetenskaplig sekreterare": "Driver vetenskapligt program, abstracts och SHF:s arbete mot SLS, NPO och FESSH.",
  "Kassör": "Ansvarar för ekonomi, firmateckning, bokföring, budget, revision och Sigtunaavtal.",
  "Utbildningsansvarig": "Bevakar utbildningsläget och samordnar ST-studierektorer, ST-skola, SK-kurser och SPUR.",
  "IT-ansvarig": "Håller webbplatsen aktuell och publicerar nyheter, mötesdokument och reseberättelser.",
  "Sekreterare": "Dokumenterar styrelse- och årsmöten och säkrar att beslut går att följa upp.",
  "Övrig ledamot": "Förvaltar medlemsregistret och stödjer styrelsen där ansvar behöver fördelas.",
};

const initialStatuses = Object.fromEntries(tasks.map((task, index) => [task.id, index < 9 ? (index % 4 === 0 ? "Klart" : index % 3 === 0 ? "Pågår" : "Att göra") : "Att göra"])) as Record<string, Status>;

export default function Home() {
  const [role, setRole] = useState<Role>("Alla");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState<number | null>(7);
  const [statuses, setStatuses] = useState<Record<string, Status>>(initialStatuses);
  const [selected, setSelected] = useState<Task | null>(null);
  const [editing, setEditing] = useState(false);
  const [view, setView] = useState<"Årshjul" | "Aktiviteter" | "Berättelse">("Årshjul");
  const [showAdd, setShowAdd] = useState(false);
  const [customTasks, setCustomTasks] = useState<Task[]>([]);
  const [taskOverrides, setTaskOverrides] = useState<Record<string, Partial<Task>>>({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shf-arshjul-state");
      if (saved) {
        const data = JSON.parse(saved);
        setStatuses({ ...initialStatuses, ...(data.statuses || {}) });
        setCustomTasks(data.customTasks || []);
        setTaskOverrides(data.taskOverrides || {});
      }
    } catch { /* börja med mallens data */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("shf-arshjul-state", JSON.stringify({ statuses, customTasks, taskOverrides }));
  }, [statuses, customTasks, taskOverrides]);

  const allTasks = useMemo(() => [...tasks, ...customTasks].map(task => ({ ...task, ...(taskOverrides[task.id] || {}) })), [customTasks, taskOverrides]);
  const visible = useMemo(() => allTasks.filter(task => (role === "Alla" || task.role === role) && (month === null || task.month === month)), [allTasks, role, month]);
  const roleTasks = allTasks.filter(task => role === "Alla" || task.role === role);
  const done = roleTasks.filter(task => statuses[task.id] === "Klart").length;
  const progress = roleTasks.length ? Math.round(done / roleTasks.length * 100) : 0;
  const nextMeeting = allTasks.find(task => task.meeting && task.month >= 7) || allTasks.find(task => task.meeting);
  const activeRoleColor = role === "Alla" ? "#e95d3f" : roles.find(item => item.name === role)?.tone || "#e95d3f";
  const yearIndex = years.indexOf(year);

  function cycle(task: Task) {
    const next: Record<Status, Status> = { "Att göra": "Pågår", "Pågår": "Klart", "Klart": "Att göra" };
    setStatuses(current => ({ ...current, [task.id]: next[current[task.id] || "Att göra"] }));
  }

  function announce(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function openTask(task: Task) {
    setEditing(false);
    setSelected(task);
  }

  return (
    <main>
      <header className="topbar">
        <button className="brand" aria-label="SHF Årshjul, startsida" onClick={() => { setView("Årshjul"); setMonth(7); }}>
          <span className="brandmark"><i /><i /><i /></span>
          <span><b>SHF</b><small>STYRELSEPORTAL</small></span>
        </button>
        <nav aria-label="Huvudnavigation">
          {(["Årshjul", "Aktiviteter", "Berättelse"] as const).map(item => <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>{item}</button>)}
        </nav>
        <div className="header-actions">
          <button className="round" aria-label="Sök" onClick={() => announce("Sökning kan kopplas till alla uppgifter och dokument i nästa version.")}>⌕</button>
          <button className="round notification" aria-label="Notiser" onClick={() => announce("3 punkter behöver uppmärksamhet före nästa styrelsemöte.")}>♢<span>3</span></button>
          <button className="add-button" onClick={() => setShowAdd(true)}>＋ Lägg till</button>
        </div>
      </header>

      <section className="rolebar" aria-label="Välj styrelsepost">
        <div className="role-label"><span>MIN VY</span><strong>Styrelsepost</strong></div>
        <div className="role-list">
          {roles.map(item => <button key={item.name} className={role === item.name ? "selected" : ""} onClick={() => { setRole(item.name); setMonth(null); }} style={{ "--role-color": item.tone } as React.CSSProperties}>
            <span>{item.short}</span>{item.name}
          </button>)}
        </div>
        <div className="progress-block"><span>Året avklarat</span><strong>{progress}%</strong><div><i style={{ width: `${progress}%` }} /></div></div>
      </section>

      {view === "Årshjul" && <>
        <section className="hero-grid">
          <div className="intro">
            <p className="eyebrow">VERKSAMHETSÅR {year}</p>
            <h1>Föreningens arbete,<br/><em>i rätt tid.</em></h1>
            <p className="lede">Ett levande årshjul för Svensk Handkirurgisk Förening. Se vad som är på gång, vem som äger frågan och vad som behöver bli klart härnäst.</p>
            <div className="today-card">
              <div className="date-cube"><b>13</b><span>AUG</span></div>
              <div><span>IDAG</span><strong>Slutspurt inför årsmötet</strong><small>{allTasks.filter(t => t.month === 7 && statuses[t.id] !== "Klart").length} öppna aktiviteter i augusti</small></div>
              <button onClick={() => { setMonth(7); document.getElementById("task-list")?.scrollIntoView({ behavior: "smooth" }); }} aria-label="Visa augustiaktiviteter">→</button>
            </div>
          </div>

          <div className="wheel-wrap">
            <div className="grand-wheel-arc"/><div className="grand-spoke left"/><div className="grand-spoke right"/>
            <div className="orbit one" /><div className="orbit two" /><div className="orbit three" />
            <div className="year-carousel" aria-live="polite">
              {years.map((wheelYear, index) => {
                const offset = index - yearIndex;
                if (Math.abs(offset) > 1) return null;
                const isCurrent = offset === 0;
                return <div key={wheelYear} className={`year-wheel-slot offset-${offset < 0 ? "previous" : offset > 0 ? "next" : "current"}`} aria-hidden={!isCurrent}>
                  <div className={`wheel ${role !== "Alla" ? "role-filtered" : ""}`} style={{ "--wheel-role-color": activeRoleColor } as React.CSSProperties} aria-label={`${wheelYear} års interaktiva årshjul`}>
                    <div className="wheel-core"><img src="/guldlogo.png" alt={isCurrent ? "Svensk Handkirurgisk Förening" : ""} /></div>
                    {months.map((name, monthIndex) => {
                      const angle = monthIndex * 30 - 90;
                      const count = allTasks.filter(task => task.month === monthIndex && (role === "Alla" || task.role === role)).length;
                      return <button key={name} tabIndex={isCurrent ? 0 : -1} disabled={!isCurrent} className={`month-node ${isCurrent && month === monthIndex ? "active" : ""}`} style={{ "--angle": `${angle}deg` } as React.CSSProperties} onClick={() => setMonth(month === monthIndex ? null : monthIndex)} aria-label={`${name} ${wheelYear}, ${count} aktiviteter`}>
                        <span>{name.slice(0,3).toUpperCase()}</span>{count > 0 && <i>{count}</i>}
                      </button>;
                    })}
                  </div>
                </div>;
              })}
            </div>
            <div className="year-switcher">
              <button disabled={yearIndex === 0} onClick={() => setYear(years[yearIndex - 1])} aria-label="Visa föregående år">←</button>
              <b>{year}</b>
              <button disabled={yearIndex === years.length - 1} onClick={() => setYear(years[yearIndex + 1])} aria-label="Visa nästa år">→</button>
            </div>
          </div>

          <aside className="pulse-panel">
            <div className="pulse-head"><span className="live-dot" /> <b>STYRELSENS PULS</b><button onClick={() => setView("Aktiviteter")}>···</button></div>
            <div className="pulse-score"><div className="ring" style={{ "--score": "76%" } as React.CSSProperties}><b>76</b><span>/100</span></div><p><strong>God fart</strong><small>Tre saker behöver er uppmärksamhet före nästa möte.</small></p></div>
            <div className="pulse-stats"><div><b>{allTasks.filter(t => statuses[t.id] === "Pågår").length}</b><span>Pågår</span></div><div><b>{allTasks.filter(t => statuses[t.id] === "Klart").length}</b><span>Klart</span></div><div><b>{allTasks.filter(t => t.month === 7 && statuses[t.id] !== "Klart").length}</b><span>I augusti</span></div></div>
            {nextMeeting && <button className="meeting" onClick={() => openTask(nextMeeting)}><span>NÄSTA GEMENSAMMA MÖTE</span><b>{nextMeeting.title}</b><small>{nextMeeting.day} {months[nextMeeting.month].toLowerCase()} · Sigtuna</small><i>→</i></button>}
            <div className="micro-story"><span>NYTT I BERÄTTELSEN</span><p>Årsmötesprogrammet har gått från planering till genomförande.</p><button onClick={() => setView("Berättelse")}>Läs berättelsen →</button></div>
          </aside>
        </section>

        <section className="timeline" aria-label="Månader">
          <button className={month === null ? "active" : ""} onClick={() => setMonth(null)}><span>HELA</span><b>ÅRET</b></button>
          {months.map((item, index) => <button key={item} className={month === index ? "active" : ""} onClick={() => setMonth(index)}><span>{String(index + 1).padStart(2,"0")}</span><b>{item.slice(0,3).toUpperCase()}</b></button>)}
        </section>
      </>}

      {view !== "Berättelse" && <section className="task-section" id="task-list">
        <div className="section-title">
          <div><p className="eyebrow">{role === "Alla" ? "HELA STYRELSEN" : role.toUpperCase()}</p><h2>{month === null ? "Årets aktiviteter" : `${months[month]} – fokus just nu`}</h2></div>
          <div className="legend"><span><i className="dot todo"/>Att göra</span><span><i className="dot doing"/>Pågår</span><span><i className="dot done"/>Klart</span></div>
        </div>
        {role !== "Alla" && <div className="role-summary"><span>{roles.find(r => r.name === role)?.short}</span><p><b>Ditt uppdrag</b>{roleSummary[role]}</p><button onClick={() => announce("Rollbeskrivningen är baserad på SHF:s arbetsdokument och kan redigeras i administrationsläget.")}>Visa hela rollen ↗</button></div>}
        <div className="task-grid">
          {visible.length ? visible.map(task => {
            const status = statuses[task.id] || "Att göra";
            return <article className={`task-card status-${status.replace(" ", "-").toLowerCase()}`} key={task.id}>
              <button className="check" aria-label={`Ändra status för ${task.title}`} onClick={() => cycle(task)}>{status === "Klart" ? "✓" : status === "Pågår" ? "–" : ""}</button>
              <div className="task-date"><b>{String(task.day || 1).padStart(2,"0")}</b><span>{months[task.month].slice(0,3).toUpperCase()}</span></div>
              <div className="task-copy"><div><span>{task.category}</span><small>{task.role}</small></div><h3>{task.title}</h3><p>{task.description}</p><button onClick={() => openTask(task)}>Öppna arbetskort <span>→</span></button></div>
              <div className={`status-pill ${status === "Klart" ? "done" : status === "Pågår" ? "doing" : "todo"}`}>{status}</div>
            </article>;
          }) : <div className="empty"><span>○</span><h3>Inga aktiviteter här ännu</h3><p>Välj en annan månad eller lägg till en ny punkt för rollen.</p><button className="add-button" onClick={() => setShowAdd(true)}>＋ Lägg till aktivitet</button></div>}
        </div>
      </section>}

      {view === "Berättelse" && <section className="story-page">
        <div className="story-intro"><p className="eyebrow">LEVANDE VERKSAMHETSBERÄTTELSE</p><h1>Ett år av arbete<br/><em>som skriver sig självt.</em></h1><p>När styrelsen markerar aktiviteter som klara samlas de här som ett utkast till verksamhetsberättelsen. Händelserna kan redigeras och kompletteras med beslut, resultat och lärdomar.</p><button className="add-button" onClick={() => announce("Ett Word-utkast kan kopplas på när redaktionell struktur är beslutad.")}>Exportera utkast ↗</button></div>
        <div className="story-stream">
          <div className="stream-line" />
          {months.map((name, index) => {
            const completed = allTasks.filter(t => t.month === index && statuses[t.id] === "Klart");
            const ongoing = allTasks.filter(t => t.month === index && statuses[t.id] === "Pågår");
            if (!completed.length && !ongoing.length) return null;
            return <article key={name}><div className="story-month"><span>{String(index+1).padStart(2,"0")}</span><b>{name}</b></div><div className="story-card"><span>{completed.length ? "GENOMFÖRT" : "PÅGÅR"}</span><h2>{completed.length ? `${completed.length} aktiviteter slutfördes` : "Arbete pågår"}</h2>{completed.map(t => <p key={t.id}><b>{t.title}.</b> {t.description}</p>)}{ongoing.map(t => <p key={t.id} className="ongoing"><b>{t.title}</b> är under arbete.</p>)}<small>Automatiskt sammanställt · Redigera text ✎</small></div></article>;
          })}
        </div>
      </section>}

      <footer><div className="brand footer-brand"><span className="brandmark"><i/><i/><i/></span><span><b>SHF</b><small>SVENSK HANDKIRURGISK FÖRENING</small></span></div><p>Årshjulet är byggt för kontinuitet – roller består när personer byts ut.</p><div className="footer-links"><a href="/test-visualisering">Test-sida ◉</a><a href="https://slf.se/svensk-handkirurgisk-forening/" target="_blank" rel="noreferrer">Till föreningens webbplats ↗</a></div></footer>

      {selected && <div className="modal-backdrop" onMouseDown={() => { setSelected(null); setEditing(false); }}>
        {editing ? <form className="modal edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title" onMouseDown={e => e.stopPropagation()} onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const updated: Task = {
            ...selected,
            title: String(data.get("title")).trim(),
            month: Number(data.get("month")),
            day: Number(data.get("day")) || 1,
            role: data.get("role") as Exclude<Role, "Alla">,
            category: data.get("category") as Task["category"],
            description: String(data.get("description")).trim(),
            checklist: String(data.get("checklist")).split("\n").map(item => item.trim()).filter(Boolean),
          };
          setTaskOverrides(current => ({ ...current, [updated.id]: updated }));
          setSelected(updated);
          setMonth(updated.month);
          setEditing(false);
          announce("Arbetskortet har uppdaterats.");
        }}>
          <button type="button" className="modal-close" onClick={() => setEditing(false)} aria-label="Avbryt redigering">×</button>
          <p className="eyebrow">REDIGERA ARBETSKORT</p><h2 id="edit-title">Ändra innehåll</h2>
          <label>Rubrik<input name="title" required defaultValue={selected.title}/></label>
          <div className="form-row"><label>Månad<select name="month" defaultValue={selected.month}>{months.map((item,index) => <option value={index} key={item}>{item}</option>)}</select></label><label>Dag<input name="day" type="number" min="1" max="31" defaultValue={selected.day || 1}/></label></div>
          <div className="form-row"><label>Ansvarig roll<select name="role" defaultValue={selected.role}>{roles.slice(1).map(item => <option key={item.name}>{item.name}</option>)}</select></label><label>Kategori<select name="category" defaultValue={selected.category}>{categories.map(item => <option key={item}>{item}</option>)}</select></label></div>
          <label>Beskrivning<textarea name="description" required rows={4} defaultValue={selected.description}/></label>
          <label>Checklista <small>En punkt per rad</small><textarea name="checklist" rows={5} defaultValue={selected.checklist.join("\n")}/></label>
          <div className="modal-actions"><button type="button" onClick={() => setEditing(false)}>Avbryt</button><button className="primary" type="submit">Spara ändringar</button></div>
        </form> : <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setSelected(null)} aria-label="Stäng">×</button><p className="eyebrow">{months[selected.month].toUpperCase()} · {selected.category.toUpperCase()}</p><h2 id="modal-title">{selected.title}</h2><p className="modal-lede">{selected.description}</p><div className="owner"><span>{roles.find(r => r.name === selected.role)?.short}</span><p><small>ANSVARIG ROLL</small><b>{selected.role}</b></p><button onClick={() => { setRole(selected.role); setSelected(null); }}>Visa roll →</button></div><h3>Checklista</h3><div className="checklist">{selected.checklist.map((item, index) => <label key={`${item}-${index}`}><input type="checkbox" defaultChecked={statuses[selected.id] === "Klart"}/><span>{item}</span><small>0{index+1}</small></label>)}</div><div className="modal-actions three"><button onClick={() => { cycle(selected); announce("Statusen uppdaterades."); }}>{statuses[selected.id] || "Att göra"} · ändra status</button><button onClick={() => setEditing(true)}>✎ Redigera kort</button><button className="primary" onClick={() => setSelected(null)}>Stäng</button></div>
        </section>}
      </div>}

      {showAdd && <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}><form className="modal add-modal" onMouseDown={e => e.stopPropagation()} onSubmit={event => {
        event.preventDefault(); const data = new FormData(event.currentTarget); const id = `custom-${Date.now()}`; const newTask: Task = { id, title: String(data.get("title")), month: Number(data.get("month")), day: Number(data.get("day")) || 1, role: data.get("role") as Exclude<Role,"Alla">, category: "Styrelse", description: String(data.get("description")) || "Ny aktivitet för styrelsens årshjul.", checklist: ["Förbered", "Genomför", "Följ upp"] }; setCustomTasks(current => [...current, newTask]); setStatuses(current => ({...current, [id]: "Att göra"})); setShowAdd(false); setMonth(newTask.month); setRole(newTask.role); announce("Aktiviteten har lagts till i årshjulet.");
      }}><button type="button" className="modal-close" onClick={() => setShowAdd(false)}>×</button><p className="eyebrow">NY PUNKT I ÅRSHJULET</p><h2>Lägg till aktivitet</h2><label>Titel<input name="title" required placeholder="Vad behöver göras?" /></label><div className="form-row"><label>Månad<select name="month" defaultValue="7">{months.map((m,i)=><option value={i} key={m}>{m}</option>)}</select></label><label>Dag<input type="number" name="day" min="1" max="31" defaultValue="15"/></label></div><label>Ansvarig roll<select name="role" defaultValue={role === "Alla" ? "Ordförande" : role}>{roles.slice(1).map(r=><option key={r.name}>{r.name}</option>)}</select></label><label>Beskrivning<textarea name="description" placeholder="Syfte, önskat resultat eller viktig bakgrund" rows={3}/></label><button className="primary submit" type="submit">Lägg till i årshjulet</button></form></div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
