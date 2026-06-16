/* js/music.js — Web Audio API romantic piano melody + toggle button */

(function () {
  'use strict';

  let audioCtx = null;
  let playing = false;
  let gainNode = null;
  let schedulerInterval = null;
  let beatTime = 0;
  let beatCount = 0;

  // Romantic piano melody — C major / A minor pentatonic
  // Frequencies in Hz for a gentle waltz-like pattern
  const MELODY = [
    // Bar 1 — C maj arpeggio
    { freq: 261.63, dur: 0.4, vol: 0.55 },  // C4
    { freq: 329.63, dur: 0.4, vol: 0.45 },  // E4
    { freq: 392.00, dur: 0.4, vol: 0.5  },  // G4
    { freq: 523.25, dur: 0.6, vol: 0.6  },  // C5
    { freq: 392.00, dur: 0.4, vol: 0.4  },  // G4
    { freq: 329.63, dur: 0.6, vol: 0.45 },  // E4
    // Bar 2 — A min
    { freq: 220.00, dur: 0.4, vol: 0.5  },  // A3
    { freq: 261.63, dur: 0.4, vol: 0.45 },  // C4
    { freq: 329.63, dur: 0.4, vol: 0.5  },  // E4
    { freq: 440.00, dur: 0.6, vol: 0.55 },  // A4
    { freq: 329.63, dur: 0.4, vol: 0.4  },  // E4
    { freq: 261.63, dur: 0.6, vol: 0.45 },  // C4
    // Bar 3 — F maj
    { freq: 349.23, dur: 0.4, vol: 0.5  },  // F4
    { freq: 440.00, dur: 0.4, vol: 0.45 },  // A4
    { freq: 523.25, dur: 0.4, vol: 0.5  },  // C5
    { freq: 698.46, dur: 0.6, vol: 0.55 },  // F5
    { freq: 523.25, dur: 0.4, vol: 0.4  },  // C5
    { freq: 440.00, dur: 0.6, vol: 0.45 },  // A4
    // Bar 4 — G maj resolve
    { freq: 392.00, dur: 0.4, vol: 0.5  },  // G4
    { freq: 493.88, dur: 0.4, vol: 0.45 },  // B4
    { freq: 587.33, dur: 0.4, vol: 0.5  },  // D5
    { freq: 783.99, dur: 0.6, vol: 0.58 },  // G5
    { freq: 587.33, dur: 0.4, vol: 0.4  },  // D5
    { freq: 392.00, dur: 0.8, vol: 0.45 },  // G4
  ];

  // Bass chord notes (played softly under melody)
  const BASS = [
    { freq: 130.81, dur: 1.2, vol: 0.2 },   // C3
    { freq: 130.81, dur: 1.2, vol: 0.2 },
    { freq: 110.00, dur: 1.2, vol: 0.18 },  // A2
    { freq: 110.00, dur: 1.2, vol: 0.18 },
    { freq: 174.61, dur: 1.2, vol: 0.18 },  // F2
    { freq: 174.61, dur: 1.2, vol: 0.18 },
    { freq: 196.00, dur: 1.2, vol: 0.2 },   // G2
    { freq: 196.00, dur: 1.2, vol: 0.2 },
  ];

  function ensureContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.connect(audioCtx.destination);
    }
  }

  function playPianoNote(freq, startTime, duration, volume) {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();

    // Piano-like tone: sine + slight harmonic
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    // Attack / decay / sustain / release envelope
    const attack  = 0.02;
    const decay   = 0.1;
    const sustain = volume * 0.6;
    const release = duration * 0.4;

    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(volume, startTime + attack);
    env.gain.linearRampToValueAtTime(sustain, startTime + attack + decay);
    env.gain.setValueAtTime(sustain, startTime + duration - release);
    env.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(env);
    env.connect(gainNode);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  function scheduleMelody() {
    const AHEAD = 0.1; // schedule 100ms ahead
    const now = audioCtx.currentTime;

    while (beatTime < now + AHEAD) {
      const note = MELODY[beatCount % MELODY.length];
      const bass = BASS[Math.floor(beatCount / 3) % BASS.length];

      playPianoNote(note.freq, beatTime, note.dur, note.vol);

      // Soft bass every 3 melody notes
      if (beatCount % 3 === 0) {
        playPianoNote(bass.freq, beatTime, bass.dur, bass.vol);
        // Add an octave higher bass
        playPianoNote(bass.freq * 2, beatTime, bass.dur * 0.8, bass.vol * 0.5);
      }

      beatTime += note.dur;
      beatCount++;
    }
  }

  function startMusic() {
    ensureContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    beatTime = audioCtx.currentTime + 0.05;

    // Fade in
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5);

    schedulerInterval = setInterval(scheduleMelody, 80);
    playing = true;
    updateBtn(true);
  }

  function stopMusic() {
    if (!audioCtx) return;
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
    clearInterval(schedulerInterval);
    playing = false;
    updateBtn(false);
  }

  function updateBtn(isPlaying) {
    const icon  = document.getElementById('music-icon');
    const label = document.getElementById('music-label');
    if (!icon || !label) return;
    icon.textContent  = isPlaying ? '♫' : '♪';
    label.textContent = isPlaying ? 'Pause' : 'Music';
    icon.style.animation = isPlaying ? 'pulse-note 1.2s ease-in-out infinite' : 'pulse-note 2s ease-in-out infinite';
  }

  window.initMusic = function () {
    const btn = document.getElementById('music-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (playing) stopMusic(); else startMusic();
    });
  };
})();
