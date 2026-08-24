"use client";

import { useRef, useState } from "react";
import "./test.css";

const months = [
  { name: "Januari", short: "JAN", count: 1, note: "Utbildning och terminsstart" },
  { name: "Februari", short: "FEB", count: 2, note: "Styrelseinternat och avgifter" },
  { name: "Mars", short: "MAR", count: 2, note: "FESSH och abstracthantering" },
  { name: "April", short: "APR", count: 2, note: "SLS och deklaration" },
  { name: "Maj", short: "MAJ", count: 2, note: "Inbjudan och Sigtunaplanering" },
  { name: "Juni", short: "JUN", count: 3, note: "Anmälan, program och register" },
  { name: "Juli", short: "JUL", count: 1, note: "Sommaröversyn av webben" },
  { name: "Augusti", short: "AUG", count: 4, note: "Revision, berättelse och årsmöte" },
  { name: "September", short: "SEP", count: 2, note: "Protokoll och funktionärer" },
  { name: "Oktober", short: "OKT", count: 2, note: "IFSSH och kursbehov" },
  { name: "November", short: "NOV", count: 2, note: "Medlemsregister och budget" },
  { name: "December", short: "DEC", count: 1, note: "Årets berättelser publiceras" },
];

export default function TestVisualisering() {
  const [tiltX, setTiltX] = useState(57);
  const [tiltY, setTiltY] = useState(-8);
  const [depth, setDepth] = useState(56);
  const [spin, setSpin] = useState(true);
  const [selected, setSelected] = useState(7);
  const drag = useRef<{ x: number; y: number; tiltX: number; tiltY: number } | null>(null);

  function reset() {
    setTiltX(57); setTiltY(-8); setDepth(56); setSpin(true); setSelected(7);
  }

  return <main className="test-shell">
    <header className="test-header">
      <a className="test-back" href="../">← Tillbaka till årshjulet</a>
      <div><span>SHF LABB / 01</span><b>Testvisualisering</b></div>
      <span className="test-badge"><i/> FRISTÅENDE EXPERIMENT</span>
    </header>

    <section className="test-grid">
      <aside className="test-copy">
        <p className="test-kicker">EN LEKPLATS FÖR FORMEN</p>
        <h1>Året som ett<br/><em>rumsligt objekt.</em></h1>
        <p>Detta är en fristående 3D-studie. Dra direkt i årshjulet, ändra perspektivet och klicka på månaderna. Ingenting här påverkar det riktiga årshjulets data.</p>
        <div className="test-tip"><b>↗ PROVA</b><span>Dra hjulet med mus eller finger för att luta det i rummet.</span></div>
      </aside>

      <div className="test-stage-wrap">
        <div className="test-glow"/>
        <div
          className="test-scene"
          style={{ "--tilt-x": `${tiltX}deg`, "--tilt-y": `${tiltY}deg`, "--depth": `${depth}px` } as React.CSSProperties}
          onPointerDown={event => {
            drag.current = { x: event.clientX, y: event.clientY, tiltX, tiltY };
            event.currentTarget.setPointerCapture(event.pointerId);
            setSpin(false);
          }}
          onPointerMove={event => {
            if (!drag.current) return;
            setTiltY(Math.max(-60, Math.min(60, drag.current.tiltY + (event.clientX - drag.current.x) * .22)));
            setTiltX(Math.max(15, Math.min(78, drag.current.tiltX - (event.clientY - drag.current.y) * .18)));
          }}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}
          aria-label="Interaktiv tredimensionell modell av SHF:s årshjul"
        >
          <div className="test-tilter">
            <div className={`test-rotor ${spin ? "is-spinning" : ""}`}>
              <div className="test-shadow-disc"/>
              <div className="test-floor-ring outer"/><div className="test-floor-ring dashed"/><div className="test-floor-ring inner"/>
              <div className="test-orbit orbit-a"/><div className="test-orbit orbit-b"/><div className="test-orbit orbit-c"/>
              <div className="test-core-back"/><button className="test-core" onClick={() => setSpin(value => !value)} aria-label={spin ? "Pausa rotation" : "Starta rotation"}>
                <span>SHF</span><b>2026</b><small>ALLA ROLLER</small><i>{spin ? "PAUSA" : "ROTERA"}</i>
              </button>
              {months.map((month, index) => {
                const angle = index * 30;
                return <button
                  key={month.name}
                  className={`test-month ${selected === index ? "is-selected" : ""}`}
                  style={{ "--month-angle": `${angle}deg`, "--counter-angle": `${-angle}deg` } as React.CSSProperties}
                  onClick={event => { event.stopPropagation(); setSelected(index); }}
                  aria-label={`${month.name}, ${month.count} aktiviteter`}
                ><span>{month.short}</span><i>{month.count}</i></button>;
              })}
            </div>
          </div>
        </div>
        <div className="test-month-info"><span>{String(selected + 1).padStart(2,"0")}</span><div><small>VALD MÅNAD</small><b>{months[selected].name}</b><p>{months[selected].note}</p></div><i>{months[selected].count} aktiviteter</i></div>
      </div>

      <aside className="test-controls">
        <div className="test-controls-head"><span>KONTROLLPANEL</span><b>Forma prototypen</b></div>
        <label><span>Lutning <i>{tiltX}°</i></span><input type="range" min="15" max="78" value={tiltX} onChange={event => { setTiltX(Number(event.target.value)); setSpin(false); }}/></label>
        <label><span>Sidovinkel <i>{tiltY}°</i></span><input type="range" min="-60" max="60" value={tiltY} onChange={event => { setTiltY(Number(event.target.value)); setSpin(false); }}/></label>
        <label><span>Djup <i>{depth}px</i></span><input type="range" min="18" max="100" value={depth} onChange={event => setDepth(Number(event.target.value))}/></label>
        <button className={`test-toggle ${spin ? "is-on" : ""}`} onClick={() => setSpin(value => !value)}><span><b>Automatisk rotation</b><small>Långsam rörelse runt året</small></span><i/></button>
        <button className="test-reset" onClick={reset}>↺ Återställ modellen</button>
        <div className="test-note"><span>EXPERIMENT 01</span><p>Nästa steg kan vara ett mer organiskt material, ljuseffekter, partiklar eller koppling till de verkliga arbetskorten.</p></div>
      </aside>
    </section>
  </main>;
}
