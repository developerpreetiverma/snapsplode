// Everything drawn flat on top of the 3D scene: hand skeletons, rings, part labels, title.
const BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

export const GESTURE_COLORS = {
  open: '#5fe0d0', relaxed: '#c8d3e0', fist: '#f2c14e', peace: '#ff7aa2', three: '#a78bfa', point: '#7bd389', pinch: '#ff9f43', none: '#c8d3e0',
};

const FINGERTIPS = [4, 8, 12, 16, 20];
const LABEL_GAP = 46;
const COLUMN_PAD = 34;
const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

export class Overlay {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
  }

  resize() {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
  }

  begin() {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  // style: 'off' draws nothing, 'subtle' only faint fingertip dots (so the object keeps
  // the attention while you teach), 'full' the whole skeleton and openness ring.
  hand(points, gesture, openness, grabbing, style = 'subtle') {
    if (style === 'off') return;
    const { ctx } = this;
    const color = GESTURE_COLORS[gesture] || GESTURE_COLORS.none;

    if (style === 'subtle') {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = grabbing ? 0.55 : 0.35;
      for (const i of FINGERTIPS) { ctx.beginPath(); ctx.arc(points[i].x, points[i].y, 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
      return;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    for (const [a, b] of BONES) { ctx.moveTo(points[a].x, points[a].y); ctx.lineTo(points[b].x, points[b].y); }
    ctx.stroke();
    ctx.fillStyle = '#fff';
    for (const p of points) { ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2); ctx.fill(); }

    // Ring around the palm: full gold when gripping, otherwise an arc showing openness.
    const cx = (points[0].x + points[9].x) / 2, cy = (points[0].y + points[9].y) / 2;
    const r = Math.hypot(points[0].x - points[9].x, points[0].y - points[9].y) * 1.75;
    ctx.lineWidth = 3;
    ctx.strokeStyle = grabbing ? GESTURE_COLORS.fist : color;
    ctx.globalAlpha = grabbing ? 0.85 : 0.55;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (grabbing ? 1 : Math.max(0.03, openness)));
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Dashed bar between two holding hands; it fills as they spread apart.
  span(a, b, amount) {
    const { ctx } = this;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = GESTURE_COLORS.fist;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    ctx.beginPath();
    ctx.moveTo(mx - ((b.x - a.x) / 2) * amount, my - ((b.y - a.y) / 2) * amount);
    ctx.lineTo(mx + ((b.x - a.x) / 2) * amount, my + ((b.y - a.y) / 2) * amount);
    ctx.stroke();
    ctx.restore();
  }

  // labels: [{ name, note, color, x, y }] where (x, y) is the part's position on screen.
  labels(labels, centre, reach, explode, highlight, leftLimit) {
    const alpha = smooth(0.12, 0.35, explode);
    if (alpha <= 0 || !labels.length) return;
    const { ctx, w, h } = this;
    const rightEdge = w - 16;
    const textW = Math.min(250, w * 0.2);
    const leftCol = Math.max(leftLimit + textW, centre.x - reach - COLUMN_PAD);
    const rightCol = Math.min(rightEdge - textW, centre.x + reach + COLUMN_PAD);

    const left = labels.filter((l) => l.x < centre.x).sort((a, b) => a.y - b.y);
    const right = labels.filter((l) => l.x >= centre.x).sort((a, b) => a.y - b.y);

    const place = (col) => {
      const top = 70, bottom = h - 120;
      const gap = Math.min(LABEL_GAP, (bottom - top) / Math.max(1, col.length));
      let y = top;
      for (const l of col) { l.ly = Math.max(y, Math.min(l.y, bottom)); y = l.ly + gap; }
      let over = col.length ? col[col.length - 1].ly - bottom : 0;
      for (let i = col.length - 1; i >= 0 && over > 0; i--) {
        col[i].ly -= over;
        if (i > 0) over = col[i - 1].ly + gap - col[i].ly;
      }
    };
    place(left);
    place(right);

    const draw = (l, isLeft) => {
      const edge = isLeft ? leftCol : rightCol;
      const dim = highlight >= 0 && highlight !== l.index ? 0.35 : 1;
      ctx.globalAlpha = alpha * dim;
      ctx.strokeStyle = l.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(edge + (isLeft ? 8 : -8), l.ly);
      ctx.stroke();
      ctx.fillStyle = l.color;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.textAlign = isLeft ? 'right' : 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.shadowColor = 'rgba(0,0,0,0.95)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#fff';
      ctx.font = '650 14px ui-sans-serif, -apple-system, sans-serif';
      ctx.fillText(l.name, edge, l.ly, textW);
      ctx.fillStyle = '#d7dde6';
      ctx.font = '12px ui-sans-serif, -apple-system, sans-serif';
      ctx.fillText(l.note, edge, l.ly + 16, textW);
      ctx.shadowBlur = 0;
    };
    left.forEach((l) => draw(l, true));
    right.forEach((l) => draw(l, false));
    ctx.globalAlpha = 1;
  }

  title(name, blurb, x, y, alpha) {
    if (alpha <= 0.01) return;
    const { ctx, w } = this;
    const fits = x + 180 < w;
    const px = fits ? x : w - 16;
    ctx.globalAlpha = alpha;
    ctx.textAlign = fits ? 'left' : 'right';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fff';
    ctx.font = '750 32px ui-sans-serif, -apple-system, sans-serif';
    ctx.fillText(name, px, y, w - px > 0 && fits ? w - px - 16 : w * 0.6);
    ctx.fillStyle = '#e0e5ec';
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif';
    ctx.fillText(blurb, px, y + 24, fits ? w - px - 16 : w * 0.6);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}
