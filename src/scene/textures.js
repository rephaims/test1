import * as THREE from 'three';

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d') };
}

// Fake "desktop" glowing on the CRT: a grid of blocky icons + a blinking cursor line.
export function createDesktopTexture() {
  const { canvas, ctx } = makeCanvas(512, 384);
  ctx.fillStyle = '#04140f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(107,255,176,0.15)';
  ctx.lineWidth = 1;
  for (let y = 0; y < canvas.height; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#6bffb0';
  ctx.font = '20px monospace';
  ctx.fillText('C:\\STUDIO> _', 24, 40);

  const labels = ['DREAM.SYS', 'WORK.OLD', 'ARCHIVE', 'README', 'SIGNAL', 'MEMORY'];
  let i = 0;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 40 + col * 160;
      const y = 100 + row * 130;
      ctx.strokeStyle = '#ffb454';
      ctx.strokeRect(x, y, 46, 36);
      ctx.fillStyle = 'rgba(255,180,84,0.25)';
      ctx.fillRect(x, y, 46, 36);
      ctx.fillStyle = '#f4f1e8';
      ctx.font = '13px monospace';
      ctx.fillText(labels[i] || '', x - 6, y + 54);
      i++;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Retro dialog-box texture used on floating "dream field" windows.
export function createDialogTexture(title, body, accent = '#6bfff2') {
  const { canvas, ctx } = makeCanvas(512, 320);
  ctx.fillStyle = '#0c0a16';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  ctx.fillStyle = accent;
  ctx.fillRect(4, 4, canvas.width - 8, 44);
  ctx.fillStyle = '#0c0a16';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(title, 20, 34);
  ctx.fillText('×', canvas.width - 40, 34);

  ctx.fillStyle = '#f4f1e8';
  ctx.font = '18px monospace';
  wrapText(ctx, body, 28, 90, canvas.width - 56, 26);

  ctx.strokeStyle = 'rgba(244,241,232,0.5)';
  ctx.strokeRect(24, canvas.height - 70, 130, 36);
  ctx.fillStyle = 'rgba(244,241,232,0.8)';
  ctx.font = '16px monospace';
  ctx.fillText('CLICK ME', 42, canvas.height - 47);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line, x, curY);
      line = word + ' ';
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, curY);
}

// Simple radial grid texture for floor/tunnel walls.
export function createGridTexture(color = '#6bfff2') {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 2;
  for (let i = 0; i <= 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
