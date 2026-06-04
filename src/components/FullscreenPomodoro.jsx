import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function FullscreenPomodoro({ onClose, noOverlay }) {
  const [workMin, setWorkMin] = useState(25);
  const [shortMin, setShortMin] = useState(5);
  const [longMin, setLongMin] = useState(15);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('work'); // work | short | long
  const [seconds, setSeconds] = useState(workMin * 60);
  const [laps, setLaps] = useState(0);
  const [stars, setStars] = useState(0);
  const [activeSound, setActiveSound] = useState(null);
  const [soundVolume, setSoundVolume] = useState(0.3);
  const audioCtxRef = useRef(null);
  const soundNodesRef = useRef([]);
  const gainRef = useRef(null);
  const intervalRef = useRef(null);

  const stopSound = useCallback(() => {
    soundNodesRef.current.forEach((n) => {
      try { n.stop(); } catch {}
      try { n.disconnect(); } catch {}
    });
    soundNodesRef.current = [];
    gainRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setActiveSound(null);
  }, []);

  const playSound = useCallback((type) => {
    if (activeSound === type) { stopSound(); return; }
    stopSound();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.value = soundVolume;
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    if (type === 'white') {
      const bufSize = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(masterGain);
      src.start();
      soundNodesRef.current.push(src);
    } else if (type === 'pink') {
      const bufSize = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i = 0; i < bufSize; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886*b0 + w*0.0555179;
        b1 = 0.99332*b1 + w*0.0750759;
        b2 = 0.96900*b2 + w*0.1538520;
        b3 = 0.86650*b3 + w*0.3104856;
        b4 = 0.55000*b4 + w*0.5329522;
        b5 = -0.7616*b5 - w*0.0168980;
        d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.11;
        b6 = w * 0.115926;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(masterGain);
      src.start();
      soundNodesRef.current.push(src);
    } else if (type === 'brown') {
      const bufSize = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let out = 0;
      for (let i = 0; i < bufSize; i++) {
        out = (out + (Math.random() * 2 - 1) * 0.02) * 0.995;
        d[i] = out * 3.5;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(masterGain);
      src.start();
      soundNodesRef.current.push(src);
    } else if (type === 'rain') {
      const bufSize = ctx.sampleRate * 4;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        const amp = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.7));
        d[i] = (Math.random() * 2 - 1) * amp * 0.3;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1200;
      src.connect(lp);
      lp.connect(masterGain);
      src.start();
      soundNodesRef.current.push(src, lp);
    } else if (type === 'forest') {
      const bufSize = ctx.sampleRate * 4;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        const chirp = Math.sin(t * 8 * Math.PI * (1 + 0.3 * Math.sin(t * 0.2))) * 0.04 * Math.max(0, Math.sin(t * 1.7));
        const rustle = (Math.random() * 2 - 1) * 0.06;
        d[i] = chirp + rustle;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(masterGain);
      src.start();
      soundNodesRef.current.push(src);
    } else if (type === 'waves') {
      const bufSize = ctx.sampleRate * 6;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        const wave = Math.sin(t * 0.15 * Math.PI * 2) * 0.5 + 0.5;
        const noise = (Math.random() * 2 - 1) * wave * 0.2;
        d[i] = noise;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 400;
      src.connect(lp);
      lp.connect(masterGain);
      src.start();
      soundNodesRef.current.push(src, lp);
    }
    setActiveSound(type);
  }, [activeSound, soundVolume, stopSound, gainRef]);

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
    <div className={noOverlay ? '' : 'fullscreen-pomodoro'} role={noOverlay ? undefined : 'dialog'} aria-modal={noOverlay ? undefined : 'true'} style={noOverlay ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : undefined}>
      <div className="fullscreen-pomodoro__panel" style={noOverlay ? { width: '100%', maxWidth: 480 } : undefined}>
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
          {!noOverlay && <button className="btn btn--ghost" onClick={() => onClose()}>Close</button>}
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

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <p className="muted small" style={{ margin: '0 0 6px' }}>Focus sounds</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { id: 'white', label: 'White' },
              { id: 'pink', label: 'Pink' },
              { id: 'brown', label: 'Brown' },
              { id: 'rain', label: 'Rain' },
              { id: 'forest', label: 'Forest' },
              { id: 'waves', label: 'Waves' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                className={`btn btn--sm ${activeSound === s.id ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => playSound(s.id)}
                style={{ fontSize: '0.75rem' }}
              >
                {activeSound === s.id ? '♪ ' : ''}{s.label}
              </button>
            ))}
          </div>
          {activeSound && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 6 }}>
              <span className="muted small">Vol:</span>
              <input type="range" min={0} max={1} step={0.05} value={soundVolume} onChange={(e) => {
                const v = parseFloat(e.target.value);
                setSoundVolume(v);
                if (gainRef.current) gainRef.current.gain.value = v;
              }} style={{ width: 100, accentColor: 'var(--accent)' }} />
              <button type="button" className="btn btn--ghost btn--sm" style={{ fontSize: '0.7rem' }} onClick={stopSound}>Stop</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
