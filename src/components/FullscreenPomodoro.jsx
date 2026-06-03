import React, { useEffect, useRef, useState } from 'react';

export default function FullscreenPomodoro({ onClose }) {
  const [workMin, setWorkMin] = useState(25);
  const [shortMin, setShortMin] = useState(5);
  const [longMin, setLongMin] = useState(15);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('work'); // work | short | long
  const [seconds, setSeconds] = useState(workMin * 60);
  const [laps, setLaps] = useState(0);
  const [stars, setStars] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (mode === 'work') setSeconds(workMin * 60);
    else if (mode === 'short') setSeconds(shortMin * 60);
    else setSeconds(longMin * 60);
    setRunning(false);
  }, [mode, workMin, shortMin, longMin]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (seconds <= 0) {
      setRunning(false);
      // beep
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 880;
        g.gain.value = 0.05;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        setTimeout(() => {
          o.stop();
          ctx.close();
        }, 250);
      } catch (e) {
        // ignore
      }

      if (mode === 'work') {
        setLaps((l) => l + 1);
        setStars((s) => s + 1);
        setMode('short');
      } else if (mode === 'short') {
        setMode('work');
      } else {
        setMode('work');
      }
    }
  }, [seconds, mode]);

  function formatTime(sec) {
    const m = Math.floor(Math.max(0, sec) / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(Math.max(0, sec) % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  }

  return (
    <div className="fullscreen-pomodoro" role="dialog" aria-modal="true">
      <div className="fullscreen-pomodoro__panel">
        <h2>Pomodoro</h2>
        <div className="fullscreen-pomodoro__time">{formatTime(seconds)}</div>
        <div className="fullscreen-pomodoro__small">Mode: {mode === 'work' ? 'Study' : mode === 'short' ? 'Short break' : 'Long break'} • Laps: {laps} <span className="fullscreen-pomodoro__star">{Array.from({length: stars}).slice(-5).map((_,i)=>( '★'))}</span></div>

        <div className="fullscreen-pomodoro__controls">
          <button className="btn btn--primary" onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Start'}</button>
          <button className="btn btn--ghost" onClick={() => {
            setRunning(false);
            if (mode === 'work') setSeconds(workMin * 60);
            else if (mode === 'short') setSeconds(shortMin * 60);
            else setSeconds(longMin * 60);
          }}>Reset</button>
          <button className="btn btn--ghost" onClick={() => onClose()}>Close</button>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
          <label style={{ color: 'var(--muted)', fontSize: 12 }}>
            Work (min)
            <input type="number" min={1} value={workMin} onChange={(e)=> setWorkMin(Math.max(1, Number(e.target.value || 25)))} className="input input--sm" style={{ width: 80, marginLeft: 8 }} />
          </label>
          <label style={{ color: 'var(--muted)', fontSize: 12 }}>
            Short break (min)
            <input type="number" min={1} value={shortMin} onChange={(e)=> setShortMin(Math.max(1, Number(e.target.value || 5)))} className="input input--sm" style={{ width: 80, marginLeft: 8 }} />
          </label>
          <label style={{ color: 'var(--muted)', fontSize: 12 }}>
            Long break (min)
            <input type="number" min={1} value={longMin} onChange={(e)=> setLongMin(Math.max(1, Number(e.target.value || 15)))} className="input input--sm" style={{ width: 80, marginLeft: 8 }} />
          </label>
        </div>

        <div style={{ marginTop: 12 }} className="muted small">Complete a work lap to earn a star. Stars persist while overlay is open.</div>
      </div>
    </div>
  );
}
