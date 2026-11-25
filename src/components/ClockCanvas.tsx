import { useEffect, useRef, useState } from 'react';
import { sound } from '../os/sound';

/** Drawn size in CSS pixels; the canvas has more pixels than this on high-density screens. */
const SIZE = 160;

/** Draws the face and hands for `now` onto a SIZE x SIZE drawing area. */
const drawClock = (ctx: CanvasRenderingContext2D, now: Date) => {
  ctx.clearRect(0, 0, SIZE, SIZE);
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = SIZE / 2 - 10;

  // Draw clock perimeter circle
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Tick hours ticks
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const outerX = cx + r * Math.sin(angle);
    const outerY = cy - r * Math.cos(angle);
    const innerX = cx + (r - (i % 3 === 0 ? 10 : 5)) * Math.sin(angle);
    const innerY = cy - (r - (i % 3 === 0 ? 10 : 5)) * Math.cos(angle);

    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(outerX, outerY);
    ctx.stroke();
  }

  // Time variables
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();

  // Hours hand
  const hAngle = ((h + m / 60) * Math.PI) / 6;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + (r - 28) * Math.sin(hAngle), cy - (r - 28) * Math.cos(hAngle));
  ctx.stroke();

  // Minutes hand
  const mAngle = ((m + s / 60) * Math.PI) / 30;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + (r - 18) * Math.sin(mAngle), cy - (r - 18) * Math.cos(mAngle));
  ctx.stroke();

  // Seconds hand (Thin red ticking needle)
  const sAngle = (s * Math.PI) / 30;
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + (r - 12) * Math.sin(sAngle), cy - (r - 12) * Math.cos(sAngle));
  ctx.stroke();

  // Center pivot dot
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();

  // Digital time underlay
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px Courier';
  ctx.textAlign = 'center';
  const timeStr = now.toLocaleTimeString();
  ctx.fillText(timeStr, cx, cy + r / 2);
};

/** The Date and Time analog clock: redrawn once a second, and only while it can be seen. */
export function ClockCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    // Nothing to draw, or tick, while the window is minimized.
    if (!canvas || canvas.offsetParent === null) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scale = window.devicePixelRatio || 1;
    if (canvas.width !== SIZE * scale) {
      canvas.width = SIZE * scale;
      canvas.height = SIZE * scale;
    }
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawClock(ctx, now);
    sound.beep(2400, 5, 'sine');
  }, [now]);

  const spoken = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Analog clock showing ${spoken}`}
      width={SIZE}
      height={SIZE}
      style={{ width: SIZE, height: SIZE, boxSizing: 'content-box' }}
      className="border-2 border-black p-1 bg-white rounded-full shadow-inner"
    />
  );
}

export default ClockCanvas;
