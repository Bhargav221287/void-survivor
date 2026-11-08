/**
 * Procedural Web Audio Sound Generator.
 * Zero external audio assets, 100% generated via Oscillator and Gain nodes.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 0.5;

  constructor() {
    // Lazily initialized on first user interaction
  }

  public init(): void {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private getMasterGain(): GainNode | null {
    if (!this.ctx || this.muted || this.volume <= 0) return null;
    const gain = this.ctx.createGain();
    gain.gain.value = this.volume;
    gain.connect(this.ctx.destination);
    return gain;
  }

  /**
   * Player laser weapon firing sound (rapid frequency slide down).
   */
  public playShoot(): void {
    this.init();
    const master = this.getMasterGain();
    if (!this.ctx || !master) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Drone firing sound (higher, subtle ping).
   */
  public playDroneShoot(): void {
    this.init();
    const master = this.getMasterGain();
    if (!this.ctx || !master) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Enemy hit sound (short acoustic blip).
   */
  public playHit(): void {
    this.init();
    const master = this.getMasterGain();
    if (!this.ctx || !master) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Enemy destruction explosion.
   */
  public playExplosion(isLarge: boolean = false): void {
    this.init();
    const master = this.getMasterGain();
    if (!this.ctx || !master) return;

    const duration = isLarge ? 0.6 : 0.28;
    const now = this.ctx.currentTime;

    // Dual oscillator explosion: deep rumble + noisy mid
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(isLarge ? 140 : 200, now);
    osc1.frequency.exponentialRampToValueAtTime(30, now + duration);

    osc2.type = "square";
    osc2.frequency.setValueAtTime(isLarge ? 80 : 120, now);
    osc2.frequency.exponentialRampToValueAtTime(20, now + duration);

    gain.gain.setValueAtTime(isLarge ? 0.45 : 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(master);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * Player damaged sound.
   */
  public playPlayerHit(): void {
    this.init();
    const master = this.getMasterGain();
    if (!this.ctx || !master) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.25);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Forcefield shield deflect.
   */
  public playShieldDeflect(): void {
    this.init();
    const master = this.getMasterGain();
    if (!this.ctx || !master) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * XP orb collection chime.
   */
  public playXpPickup(): void {
    this.init();
    const master = this.getMasterGain();
    if (!this.ctx || !master) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // High crystalline sine
    osc.type = "sine";
    osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Heal orb collection chime (positive two-tone).
   */
  public playHeal(): void {
    this.init();
    const master = this.getMasterGain();
    if (!this.ctx || !master) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.06;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      osc.connect(gain);
      gain.connect(master);

      osc.start(noteTime);
      osc.stop(noteTime + 0.15);
    });
  }

  /**
   * Level up / wave cleared celebration fanfare.
   */
  public playLevelUp(): void {
    this.init();
    const master = this.getMasterGain();
    if (!this.ctx || !master) return;

    const now = this.ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880]; // A major

    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.08;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(master);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  /**
   * Boss incoming alert siren.
   */
  public playBossAlert(): void {
    this.init();
    const master = this.getMasterGain();
    if (!this.ctx || !master) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.25);
    osc.frequency.linearRampToValueAtTime(220, now + 0.5);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  /**
   * Game over descending sad drone.
   */
  public playGameOver(): void {
    this.init();
    const master = this.getMasterGain();
    if (!this.ctx || !master) return;

    const now = this.ctx.currentTime;
    const notes = [440, 415.3, 392, 349.23]; // Descending chromatic / minor

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.15;

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.28, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(master);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }
}

export const soundManager = new SoundManager();
