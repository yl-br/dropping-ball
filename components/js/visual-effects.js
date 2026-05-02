export function trigger_golden_butterfly_effect(engine, ) {

  const DURATION_MS = 2000;
  const NUM_BUTTERFLIES = 18;
  const startTime = Date.now();
  const ctx = engine.ctx;
  const canvasWidth = engine.canvas.width;
  const canvasHeight = engine.canvas.height;

  engine.is_butterfly_playing = true;

  return new Promise((resolve) => {

  // Build butterfly data
  const butterflies = Array.from({ length: NUM_BUTTERFLIES }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 1.8,
    vy: -(Math.random() * 1.2 + 0.5),
    phase: Math.random() * Math.PI * 2,      // wing-flap phase offset
    flapSpeed: 0.12 + Math.random() * 0.08,  // flap speed
    size: 10 + Math.random() * 10,           // body/wing scale
    wobble: (Math.random() - 0.5) * 0.04,   // horizontal drift
    alpha: 1,
  }));

  const drawButterfly = (x, y, size, flapAngle, alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);

    // Wing flap: flapAngle goes 0→PI (closed) using a sine curve
    const wingSpread = Math.abs(Math.cos(flapAngle)); // 1=fully open, 0=closed

    // Gold gradient helper
    const makeGold = (x1, y1, x2, y2) => {
      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      g.addColorStop(0, '#FFD700');
      g.addColorStop(0.4, '#FFF176');
      g.addColorStop(0.7, '#FFC200');
      g.addColorStop(1, '#FF8C00');
      return g;
    };

    // ── Left wings ──
    ctx.save();
    ctx.scale(-wingSpread, 1); // mirror-flap left side

    // Upper-left wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 1.6, -size * 0.4, -size * 2, -size * 1.6, -size * 0.6, -size * 1.4);
    ctx.bezierCurveTo(-size * 0.2, -size * 1.2, -size * 0.1, -size * 0.5, 0, 0);
    ctx.fillStyle = makeGold(-size * 2, -size * 1.6, 0, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,120,0,0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Lower-left wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 1.2, size * 0.2, -size * 1.4, size * 1.2, -size * 0.4, size * 1.0);
    ctx.bezierCurveTo(-size * 0.1, size * 0.8, 0, size * 0.3, 0, 0);
    ctx.fillStyle = makeGold(-size * 1.4, size * 1.2, 0, 0);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // ── Right wings (mirror) ──
    ctx.save();
    ctx.scale(wingSpread, 1);

    // Upper-right wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 1.6, -size * 0.4, size * 2, -size * 1.6, size * 0.6, -size * 1.4);
    ctx.bezierCurveTo(size * 0.2, -size * 1.2, size * 0.1, -size * 0.5, 0, 0);
    ctx.fillStyle = makeGold(size * 2, -size * 1.6, 0, 0);
    ctx.fill();
    ctx.stroke();

    // Lower-right wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 1.2, size * 0.2, size * 1.4, size * 1.2, size * 0.4, size * 1.0);
    ctx.bezierCurveTo(size * 0.1, size * 0.8, 0, size * 0.3, 0, 0);
    ctx.fillStyle = makeGold(size * 1.4, size * 1.2, 0, 0);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // ── Body ──
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.12, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#5D3A00';
    ctx.fill();

    // ── Antennae ──
    ctx.strokeStyle = '#5D3A00';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.4);
    ctx.quadraticCurveTo(-size * 0.6, -size * 1.2, -size * 0.5, -size * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.1, -size * 0.4);
    ctx.quadraticCurveTo(size * 0.6, -size * 1.2, size * 0.5, -size * 1.5);
    ctx.stroke();
    // Antenna tips
    [[-size * 0.5, -size * 1.5], [size * 0.5, -size * 1.5]].forEach(([tx, ty]) => {
      ctx.beginPath();
      ctx.arc(tx, ty, size * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#5D3A00';
      ctx.fill();
    });

    ctx.restore();
  };

  // Sparkle pool
  const sparkles = [];
  const addSparkle = (x, y) => {
    sparkles.push({ x, y, life: 1, size: 2 + Math.random() * 3 });
  };

  let frameId;
  const animate = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= DURATION_MS) {
      cancelAnimationFrame(frameId);
      engine.is_butterfly_playing = false;
      resolve();
      return;
    }

    // Fade out in the last 400 ms
    const globalAlpha = elapsed > DURATION_MS - 400
      ? 1 - (elapsed - (DURATION_MS - 400)) / 400
      : 1;

    // Redraw background (erase + leaves already gone, just clear)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw score on top
    ctx.font = "32px Arial";
    ctx.fillStyle = "#5E397A";
    ctx.fillText(`Score: ${engine.points}`, 8, 30);

    // Sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.life -= 0.04;
      if (s.life <= 0) { sparkles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = s.life * globalAlpha;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Update & draw butterflies
    butterflies.forEach(b => {
      b.phase += b.flapSpeed;
      b.x += b.vx + Math.sin(b.phase * 0.5) * 0.8;
      b.y += b.vy + Math.cos(b.phase * 0.3) * 0.5;
      b.vx += b.wobble;
      // Wrap around canvas edges
      if (b.x < -b.size * 2) b.x = canvasWidth + b.size;
      if (b.x > canvasWidth + b.size * 2) b.x = -b.size;
      if (b.y < -b.size * 2) b.y = canvasHeight + b.size;
      if (b.y > canvasHeight + b.size * 2) b.y = -b.size;

      // Occasionally shed a sparkle
      if (Math.random() < 0.15) addSparkle(b.x, b.y);

      drawButterfly(b.x, b.y, b.size, b.phase, globalAlpha);
    });

    frameId = requestAnimationFrame(animate);
  };

  frameId = requestAnimationFrame(animate);
  }); // end Promise

}
