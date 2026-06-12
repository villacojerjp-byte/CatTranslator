/**
 * Generates synthesized cat vocalization WAVs into assets/sounds/.
 * All audio is procedurally generated (no licensed samples).
 * Run: node scripts/generate-sounds.js
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

function writeWav(filename, samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
  console.log('wrote', filename, (buffer.length / 1024).toFixed(1) + 'KB');
}

function seconds(s) {
  return Math.floor(s * SAMPLE_RATE);
}

// Simple seeded PRNG so output is deterministic.
let seed = 42;
function rand() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}

/**
 * One meow syllable: fundamental glides along `pitchCurve` (array of [t01, hz]),
 * with harmonics shaped to sound feline, vibrato, and an ADSR-ish envelope.
 */
function meowSyllable({
  duration = 0.7,
  pitchCurve = [[0, 600], [0.25, 850], [0.6, 800], [1, 450]],
  vibratoHz = 6,
  vibratoDepth = 0.02,
  breathiness = 0.04,
  harmonics = [1, 0.55, 0.3, 0.18, 0.1],
  gain = 0.8,
}) {
  const n = seconds(duration);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t01 = i / n;
    // piecewise-linear pitch
    let hz = pitchCurve[pitchCurve.length - 1][1];
    for (let k = 0; k < pitchCurve.length - 1; k++) {
      const [t0, f0] = pitchCurve[k];
      const [t1, f1] = pitchCurve[k + 1];
      if (t01 >= t0 && t01 <= t1) {
        hz = f0 + ((t01 - t0) / (t1 - t0)) * (f1 - f0);
        break;
      }
    }
    hz *= 1 + vibratoDepth * Math.sin(2 * Math.PI * vibratoHz * (i / SAMPLE_RATE));
    phase += (2 * Math.PI * hz) / SAMPLE_RATE;
    let s = 0;
    for (let h = 0; h < harmonics.length; h++) {
      s += harmonics[h] * Math.sin(phase * (h + 1));
    }
    s += breathiness * (rand() * 2 - 1);
    // envelope: fast attack, sustain, smooth release
    const attack = Math.min(1, t01 / 0.08);
    const release = Math.min(1, (1 - t01) / 0.25);
    out[i] = s * attack * release * gain * 0.35;
  }
  return out;
}

function silence(duration) {
  return new Float64Array(seconds(duration));
}

function concat(...parts) {
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Float64Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

function purr({ duration = 2.0, gain = 0.7 }) {
  const n = seconds(duration);
  const out = new Float64Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const t01 = i / n;
    // low rumble: filtered noise + 90Hz tone, amplitude-modulated at ~24Hz (purr rate)
    const noise = rand() * 2 - 1;
    lp = lp + 0.06 * (noise - lp); // crude low-pass
    const tone = 0.5 * Math.sin(2 * Math.PI * 88 * t) + 0.25 * Math.sin(2 * Math.PI * 176 * t);
    const purrMod = 0.55 + 0.45 * Math.sin(2 * Math.PI * 24 * t);
    const breathe = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.5 * t); // slow in/out breath
    const edge = Math.min(1, t01 / 0.1, (1 - t01) / 0.1);
    out[i] = (lp * 2.2 + tone) * purrMod * breathe * edge * gain * 0.3;
  }
  return out;
}

function hiss({ duration = 1.1, gain = 0.6 }) {
  const n = seconds(duration);
  const out = new Float64Array(n);
  let hp = 0;
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t01 = i / n;
    const noise = rand() * 2 - 1;
    // high-pass the noise for a sibilant hiss
    hp = 0.92 * (hp + noise - prev);
    prev = noise;
    const attack = Math.min(1, t01 / 0.05);
    const release = Math.min(1, (1 - t01) / 0.35);
    out[i] = hp * attack * release * gain * 0.5;
  }
  return out;
}

function trill({ duration = 0.6, baseHz = 700, gain = 0.75 }) {
  // rolled "brrr" greeting trill: fast 28Hz amplitude+pitch modulation
  const n = seconds(duration);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const t01 = i / n;
    const hz = baseHz * (1 + 0.1 * Math.sin(2 * Math.PI * 28 * t)) * (1 + 0.15 * t01);
    phase += (2 * Math.PI * hz) / SAMPLE_RATE;
    const s = Math.sin(phase) + 0.4 * Math.sin(2 * phase) + 0.2 * Math.sin(3 * phase);
    const mod = 0.6 + 0.4 * Math.sin(2 * Math.PI * 28 * t);
    const edge = Math.min(1, t01 / 0.08, (1 - t01) / 0.2);
    out[i] = s * mod * edge * gain * 0.3;
  }
  return out;
}

function growl({ duration = 1.4, gain = 0.7 }) {
  const n = seconds(duration);
  const out = new Float64Array(n);
  let phase = 0;
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const t01 = i / n;
    const hz = 95 + 25 * Math.sin(2 * Math.PI * 1.2 * t) - 20 * t01;
    phase += (2 * Math.PI * hz) / SAMPLE_RATE;
    // pulse-ish waveform (odd harmonics) for menace
    const s = Math.sin(phase) + 0.6 * Math.sin(3 * phase) + 0.35 * Math.sin(5 * phase);
    const noise = rand() * 2 - 1;
    lp = lp + 0.04 * (noise - lp);
    const edge = Math.min(1, t01 / 0.15, (1 - t01) / 0.2);
    out[i] = (s * 0.6 + lp * 1.6) * edge * gain * 0.32;
  }
  return out;
}

const sounds = {
  // friendly hello: bright two-tone meow
  'meow-hello.wav': concat(
    meowSyllable({ duration: 0.55, pitchCurve: [[0, 620], [0.3, 900], [1, 650]] }),
    silence(0.12),
    meowSyllable({ duration: 0.45, pitchCurve: [[0, 700], [0.4, 950], [1, 700]], gain: 0.7 })
  ),
  // hungry: insistent, repeated demanding meows
  'meow-hungry.wav': concat(
    meowSyllable({ duration: 0.5, pitchCurve: [[0, 550], [0.2, 880], [0.7, 860], [1, 500]], gain: 0.9 }),
    silence(0.1),
    meowSyllable({ duration: 0.55, pitchCurve: [[0, 560], [0.2, 900], [0.7, 880], [1, 480]], gain: 0.95 }),
    silence(0.1),
    meowSyllable({ duration: 0.65, pitchCurve: [[0, 540], [0.25, 920], [0.75, 900], [1, 450]], gain: 1 })
  ),
  // love: soft trill into a gentle mew
  'meow-love.wav': concat(
    trill({ duration: 0.5, baseHz: 650 }),
    silence(0.08),
    meowSyllable({ duration: 0.7, pitchCurve: [[0, 700], [0.35, 820], [1, 600]], vibratoDepth: 0.015, gain: 0.6 })
  ),
  // angry: growl then hiss
  'angry.wav': concat(growl({ duration: 1.1 }), silence(0.08), hiss({ duration: 0.8 })),
  // sad: long descending mournful mew
  'meow-sad.wav': meowSyllable({
    duration: 1.1,
    pitchCurve: [[0, 750], [0.2, 800], [1, 380]],
    vibratoHz: 5,
    vibratoDepth: 0.03,
    gain: 0.7,
  }),
  // sleepy: quiet, slow, low mew
  'meow-sleepy.wav': meowSyllable({
    duration: 0.9,
    pitchCurve: [[0, 480], [0.4, 560], [1, 380]],
    vibratoHz: 4,
    vibratoDepth: 0.02,
    breathiness: 0.08,
    gain: 0.5,
  }),
  // playful: three quick rising chirps
  'chirp-playful.wav': concat(
    meowSyllable({ duration: 0.2, pitchCurve: [[0, 700], [1, 1100]], gain: 0.7 }),
    silence(0.09),
    meowSyllable({ duration: 0.2, pitchCurve: [[0, 750], [1, 1150]], gain: 0.75 }),
    silence(0.09),
    meowSyllable({ duration: 0.28, pitchCurve: [[0, 800], [0.6, 1200], [1, 900]], gain: 0.8 })
  ),
  // purr: contentment rumble
  'purr.wav': purr({ duration: 2.2 }),
  // attention: one loud long meow
  'meow-attention.wav': meowSyllable({
    duration: 1.0,
    pitchCurve: [[0, 500], [0.15, 950], [0.7, 920], [1, 520]],
    gain: 1,
  }),
  // curious: rising question-like mew
  'meow-curious.wav': meowSyllable({
    duration: 0.6,
    pitchCurve: [[0, 550], [0.6, 750], [1, 1000]],
    gain: 0.7,
  }),
  // scared: sharp high yowl
  'yowl-scared.wav': meowSyllable({
    duration: 0.9,
    pitchCurve: [[0, 900], [0.3, 1200], [0.8, 1100], [1, 700]],
    vibratoHz: 9,
    vibratoDepth: 0.04,
    gain: 0.85,
  }),
  // greeting trill alone
  'trill-greeting.wav': trill({ duration: 0.7, baseHz: 720 }),
};

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const [name, samples] of Object.entries(sounds)) {
  writeWav(name, samples);
}
console.log('Done:', Object.keys(sounds).length, 'sounds in', OUT_DIR);
