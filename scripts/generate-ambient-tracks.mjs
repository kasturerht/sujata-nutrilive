// scripts/generate-ambient-tracks.mjs
// Studio-Quality 44.1kHz Stereo Ambient Audio Generator for Sujata Nutrilive
// Generates 100% Royalty-Free, Copyright-Strike-Proof, Elegant Thematic Soundtracks

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const audioDir = path.join(__dirname, '..', 'assets', 'audio');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const SAMPLE_RATE = 44100;

function createWavBuffer(leftChannel, rightChannel) {
  const numSamples = leftChannel.length;
  const bytesPerSample = 2; // 16-bit
  const numChannels = 2; // Stereo
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample (16)

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write samples with limiter / soft clipping to prevent distortion
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    let sL = Math.max(-1, Math.min(1, leftChannel[i]));
    let sR = Math.max(-1, Math.min(1, rightChannel[i]));

    // Soft saturation tanh-like curve
    sL = sL * (1.5 - 0.5 * sL * sL);
    sR = sR * (1.5 - 0.5 * sR * sR);

    const intL = Math.round(sL * 32767);
    const intR = Math.round(sR * 32767);

    buffer.writeInt16LE(intL, offset);
    buffer.writeInt16LE(intR, offset + 2);
    offset += 4;
  }

  return buffer;
}

// --- SYNTHESIZERS ---

// 1. NAVRATRI AMBIENT: Energetic Garba Dhol rhythm, temple manjira bells, warm festive acoustic pulse
function generateNavratri(durationSec = 12) {
  const numSamples = SAMPLE_RATE * durationSec;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  const bpm = 104; // Classic Garba tempo
  const beatInterval = (60 / bpm) * SAMPLE_RATE;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const fadeIn = Math.min(1, t / 0.8);
    const fadeOut = Math.min(1, (durationSec - t) / 1.0);
    const masterEnv = fadeIn * fadeOut;

    let sampleL = 0;
    let sampleR = 0;

    // A. Warm Drone (Tanpura / Indian Harmonium base) in D
    const dFreq = 146.83; // D3
    sampleL += 0.12 * Math.sin(2 * Math.PI * dFreq * t);
    sampleR += 0.12 * Math.sin(2 * Math.PI * dFreq * t + 0.1);
    sampleL += 0.06 * Math.sin(2 * Math.PI * (dFreq * 1.5) * t); // Fifth (A)
    sampleR += 0.06 * Math.sin(2 * Math.PI * (dFreq * 2) * t);   // Octave (D4)

    // B. Dhol Bass & Slap (Syncopated Garba 6/8 and 8-beat rhythm)
    const beatPos = i % beatInterval;
    const beatIndex = Math.floor((i / beatInterval) % 4);

    // Deep Dhol Bass (Dhama) on beat 0 and 2
    if (beatIndex === 0 || beatIndex === 2) {
      const bassT = beatPos / SAMPLE_RATE;
      if (bassT < 0.35) {
        const bassPitch = 75 * Math.exp(-bassT * 12);
        const bassEnv = Math.exp(-bassT * 9);
        const bassWave = Math.sin(2 * Math.PI * bassPitch * bassT);
        sampleL += 0.35 * bassWave * bassEnv;
        sampleR += 0.35 * bassWave * bassEnv;
      }
    }

    // Snappy Dhol Tappi / Slap on off-beats
    const subBeatPos = i % (beatInterval / 2);
    const subBeatIndex = Math.floor((i / (beatInterval / 2)) % 8);
    if (subBeatIndex === 1 || subBeatIndex === 3 || subBeatIndex === 6) {
      const slapT = subBeatPos / SAMPLE_RATE;
      if (slapT < 0.18) {
        const slapPitch = 320 * Math.exp(-slapT * 25);
        const slapEnv = Math.exp(-slapT * 22);
        const noise = (Math.random() * 2 - 1) * 0.15;
        const slapWave = (Math.sin(2 * Math.PI * slapPitch * slapT) + noise) * slapEnv;
        sampleL += 0.22 * slapWave;
        sampleR += 0.20 * slapWave;
      }
    }

    // C. Manjira / Ghungroo Bells (Gentle metallic chime rhythm)
    const bellInterval = beatInterval / 4;
    const bellPos = i % bellInterval;
    const bellT = bellPos / SAMPLE_RATE;
    if (bellT < 0.08) {
      const bellEnv = Math.exp(-bellT * 35);
      const bellSound = (Math.sin(2 * Math.PI * 3492 * bellT) * 0.5 + Math.sin(2 * Math.PI * 5274 * bellT) * 0.5) * bellEnv;
      sampleL += 0.08 * bellSound;
      sampleR += 0.11 * bellSound;
    }

    // D. Shehnai / Festive Flute Melody in Raag Durga (D - E - G - A - B - D)
    const notes = [293.66, 329.63, 392.00, 440.00, 493.88, 587.33]; // D4, E4, G4, A4, B4, D5
    const noteIdx = Math.floor((t * 2) % notes.length);
    const noteFreq = notes[noteIdx];
    const vibrato = 1 + 0.015 * Math.sin(2 * Math.PI * 5.5 * t);
    const fluteWave = Math.sin(2 * Math.PI * (noteFreq * vibrato) * t) + 0.3 * Math.sin(2 * Math.PI * (noteFreq * 2 * vibrato) * t);
    sampleL += 0.14 * fluteWave;
    sampleR += 0.14 * fluteWave;

    left[i] = sampleL * masterEnv;
    right[i] = sampleR * masterEnv;
  }

  return createWavBuffer(left, right);
}

// 2. DIWALI AMBIENT: Royal Sitar arpeggio, temple chimes, serene prosperity glow
function generateDiwali(durationSec = 12) {
  const numSamples = SAMPLE_RATE * durationSec;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const masterEnv = Math.min(1, t / 0.8) * Math.min(1, (durationSec - t) / 1.0);

    // Warm Tanpura Drone in C#
    const cFreq = 138.59;
    let sL = 0.15 * Math.sin(2 * Math.PI * cFreq * t) + 0.08 * Math.sin(2 * Math.PI * (cFreq * 1.5) * t);
    let sR = 0.15 * Math.sin(2 * Math.PI * cFreq * t + 0.1) + 0.08 * Math.sin(2 * Math.PI * (cFreq * 2) * t);

    // Sitar Plucks (C# - F - G# - C# - D# - F)
    const sitarScale = [277.18, 349.23, 415.30, 554.37, 622.25, 698.46];
    const sitarIdx = Math.floor((t * 1.8) % sitarScale.length);
    const sitarPos = (t * 1.8) % 1;
    const sitarT = sitarPos / 1.8;
    const sitarEnv = Math.exp(-sitarT * 5);
    const f = sitarScale[sitarIdx];
    // Sitar has rich jawari buzz (harmonics)
    const sitarWave = (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * 2 * f * t) + 0.25 * Math.sin(2 * Math.PI * 3 * f * t) + 0.15 * Math.sin(2 * Math.PI * 4 * f * t)) * sitarEnv;
    sL += 0.22 * sitarWave;
    sR += 0.25 * sitarWave;

    // Temple Wind Chimes
    const chime = (Math.sin(2 * Math.PI * 4200 * t) * Math.sin(2 * Math.PI * 0.7 * t) * 0.04);
    sL += chime;
    sR += chime;

    left[i] = sL * masterEnv;
    right[i] = sR * masterEnv;
  }

  return createWavBuffer(left, right);
}

// 3. AYURVEDA ZEN: Bamboo flute, nature stream pink noise, peaceful 432Hz healing resonance
function generateAyurveda(durationSec = 12) {
  const numSamples = SAMPLE_RATE * durationSec;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  let b0 = 0, b1 = 0, b2 = 0; // For gentle pink noise (natural stream)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const masterEnv = Math.min(1, t / 1.0) * Math.min(1, (durationSec - t) / 1.2);

    // Natural stream ambient (filtered pink noise)
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.05;
    b1 = 0.96300 * b1 + white * 0.07;
    b2 = 0.57000 * b2 + white * 0.15;
    const stream = (b0 + b1 + b2) * 0.018;

    // 432 Hz Sacred Tibetan Bowl Healing Tone
    const bowl = Math.sin(2 * Math.PI * 432 * t) * 0.08 * (1 + 0.2 * Math.sin(2 * Math.PI * 0.2 * t));

    // Serene Bamboo Flute in E minor pentatonic (E4 - G4 - A4 - B4 - D5 - E5)
    const fluteNotes = [329.63, 392.00, 440.00, 493.88, 587.33, 659.25];
    const fluteIdx = Math.floor((t * 0.7) % fluteNotes.length);
    const fT = (t * 0.7) % 1;
    const fluteEnv = Math.sin(Math.PI * fT);
    const fFreq = fluteNotes[fluteIdx];
    const breath = (Math.random() * 2 - 1) * 0.03;
    const vibrato = 1 + 0.012 * Math.sin(2 * Math.PI * 4.8 * t);
    const fluteWave = (Math.sin(2 * Math.PI * (fFreq * vibrato) * t) + breath) * fluteEnv;

    const sL = stream + bowl + 0.22 * fluteWave;
    const sR = stream + bowl + 0.22 * fluteWave;

    left[i] = sL * masterEnv;
    right[i] = sR * masterEnv;
  }

  return createWavBuffer(left, right);
}

// 4. LUXURY BEAUTY: Aesthetic Lo-Fi Chill Chords, soft vinyl warmth, modern luxury brand feel
function generateLuxuryBeauty(durationSec = 12) {
  const numSamples = SAMPLE_RATE * durationSec;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const masterEnv = Math.min(1, t / 0.6) * Math.min(1, (durationSec - t) / 0.8);

    // Lo-Fi Chords: Fmaj7 -> Em7 -> Dm7 -> Cmaj7
    const chords = [
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [329.63, 392.00, 493.88, 587.33], // Em7
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [261.63, 329.63, 392.00, 493.88]  // Cmaj7
    ];

    const chordIdx = Math.floor((t / 3) % chords.length);
    const currentChord = chords[chordIdx];
    let chordL = 0;
    let chordR = 0;

    for (let c = 0; c < currentChord.length; c++) {
      const f = currentChord[c];
      const sine = Math.sin(2 * Math.PI * f * t);
      chordL += sine * 0.05;
      chordR += Math.sin(2 * Math.PI * f * t + 0.05 * c) * 0.05;
    }

    // Gentle Lo-Fi Beat (Soft Kick on 1 and 3, Soft Snare on 2 and 4)
    const beatInterval = 0.75 * SAMPLE_RATE; // 80 BPM
    const beatPos = i % beatInterval;
    const beatT = beatPos / SAMPLE_RATE;
    const beatIdx = Math.floor((i / beatInterval) % 4);

    let drum = 0;
    if (beatIdx === 0 || beatIdx === 2) {
      // Soft Warm Sub Kick
      if (beatT < 0.2) {
        drum += Math.sin(2 * Math.PI * (60 * Math.exp(-beatT * 15)) * beatT) * Math.exp(-beatT * 10) * 0.3;
      }
    } else {
      // Soft Rimshot / Lo-Fi Snare
      if (beatT < 0.15) {
        drum += (Math.random() * 2 - 1) * Math.exp(-beatT * 22) * 0.15;
      }
    }

    // Vinyl crackle / subtle warmth
    const vinyl = (Math.random() > 0.998 ? (Math.random() * 2 - 1) * 0.04 : 0);

    const sL = (chordL + drum * 0.7 + vinyl);
    const sR = (chordR + drum * 0.7 + vinyl);

    left[i] = sL * masterEnv;
    right[i] = sR * masterEnv;
  }

  return createWavBuffer(left, right);
}

// 5. WELLNESS ACOUSTIC: Bright, positive acoustic fingerpicking & warm energy
function generateWellnessAcoustic(durationSec = 12) {
  const numSamples = SAMPLE_RATE * durationSec;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const masterEnv = Math.min(1, t / 0.5) * Math.min(1, (durationSec - t) / 0.8);

    // Acoustic Guitar Arpeggio (G major: G - B - D - G - B - D)
    const arpeggio = [196.00, 246.94, 293.66, 392.00, 493.88, 587.33];
    const arpIdx = Math.floor((t * 4) % arpeggio.length);
    const arpT = (t * 4) % 1;
    const arpEnv = Math.exp(-arpT * 4);
    const f = arpeggio[arpIdx];
    const guitar = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * 2 * f * t) + 0.1 * Math.sin(2 * Math.PI * 3 * f * t)) * arpEnv;

    // Upright Warm Bass
    const bassFreq = 98.00; // G2
    const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.12;

    const sL = 0.22 * guitar + bass;
    const sR = 0.24 * guitar + bass;

    left[i] = sL * masterEnv;
    right[i] = sR * masterEnv;
  }

  return createWavBuffer(left, right);
}

// --- WRITE ALL 5 TRACKS ---
console.log('🎵 Generating Sujata Nutrilive Smart Thematic Audio Library...');

const tracks = [
  { name: 'navratri_ambient.wav', gen: generateNavratri },
  { name: 'diwali_ambient.wav', gen: generateDiwali },
  { name: 'ayurveda_zen.wav', gen: generateAyurveda },
  { name: 'luxury_beauty.wav', gen: generateLuxuryBeauty },
  { name: 'wellness_acoustic.wav', gen: generateWellnessAcoustic }
];

for (const tr of tracks) {
  const targetPath = path.join(audioDir, tr.name);
  const buf = tr.gen(12);
  fs.writeFileSync(targetPath, buf);
  console.log(`✅ Generated: ${tr.name} (${(buf.length / 1024).toFixed(1)} KB) -> ${targetPath}`);
}

console.log('🎉 Smart Audio Library successfully generated!');
