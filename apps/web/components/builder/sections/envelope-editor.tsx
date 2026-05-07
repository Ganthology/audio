"use client";

import type { Envelope } from "@web-kits/audio";
import { useEffect, useRef } from "react";
import { SliderField } from "../controls";
import type { BuilderAction } from "../state";
import styles from "../styles.module.css";

type Props = {
  index: number;
  envelope: Envelope | undefined;
  dispatch: React.Dispatch<BuilderAction>;
};

type EnvelopeKey = keyof Envelope;

type EnvelopeFieldConfig = {
  key: EnvelopeKey;
  label: string;
  min: number;
  max: number;
  step: number;
  fallback: number;
  format: (v: number) => string;
};

const FIELDS: ReadonlyArray<EnvelopeFieldConfig> = [
  {
    key: "attack",
    label: "Attack",
    min: 0,
    max: 2,
    step: 0.01,
    fallback: 0,
    format: (v) => `${v.toFixed(2)}s`,
  },
  {
    key: "decay",
    label: "Decay",
    min: 0.01,
    max: 4,
    step: 0.01,
    fallback: 0.3,
    format: (v) => `${v.toFixed(2)}s`,
  },
  {
    key: "sustain",
    label: "Sustain",
    min: 0,
    max: 1,
    step: 0.01,
    fallback: 0,
    format: (v) => v.toFixed(2),
  },
  {
    key: "release",
    label: "Release",
    min: 0,
    max: 4,
    step: 0.01,
    fallback: 0,
    format: (v) => `${v.toFixed(2)}s`,
  },
];

export function EnvelopeEditor({ index, envelope, dispatch }: Props) {
  const env = envelope ?? { decay: 0.3 };
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const update = (key: EnvelopeKey, value: number) => {
    dispatch({
      type: "set-envelope",
      index,
      envelope: { ...env, [key]: value },
    });
  };

  useEffect(() => {
    drawADSR(canvasRef.current, env);
  }, [env]);

  return (
    <div className={styles.section}>
      <span className={styles.sectionLabel}>Envelope</span>

      <div className={styles.adsrCurve}>
        <canvas ref={canvasRef} className={styles.adsrCanvas} />
      </div>

      {FIELDS.map((field) => {
        const value = env[field.key] ?? field.fallback;
        return (
          <SliderField
            key={field.key}
            label={field.label}
            value={value}
            min={field.min}
            max={field.max}
            step={field.step}
            onValueChange={(v) => update(field.key, v)}
            displayValue={field.format(value)}
          />
        );
      })}
    </div>
  );
}

function drawADSR(canvas: HTMLCanvasElement | null, env: Envelope) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const pad = 8;
  const drawW = w - pad * 2;
  const drawH = h - pad * 2;

  const a = env.attack ?? 0;
  const d = env.decay;
  const s = env.sustain ?? 0;
  const r = env.release ?? 0;

  const total = a + d + Math.max(r, 0.2);
  const scale = drawW / total;

  const x0 = pad;
  const y0 = pad + drawH;
  const xA = x0 + a * scale;
  const xD = xA + d * scale;
  const xR = xD + Math.max(r, 0.2) * scale;
  const yTop = pad;
  const ySustain = pad + drawH * (1 - s);

  const style = getComputedStyle(canvas);
  const strokeColor = style.getPropertyValue("--ds-gray-8").trim() || "#888";

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(xA, yTop);
  ctx.lineTo(xD, ySustain);
  ctx.lineTo(xR, y0);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";
  ctx.stroke();
}
