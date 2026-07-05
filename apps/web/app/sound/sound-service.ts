import {
  type SoundBus,
  type SoundDefinition,
  type SoundDucking,
  type SoundId,
  type SoundPlayOptions,
  SoundPlayOptionsSchema,
} from "./schema";

type BusNodes = {
  input: GainNode;
  baseGain: GainNode;
  duckGain: GainNode;
  pan: StereoPannerNode | null;
};

type Voice = {
  bus: SoundBus;
  duckTokens: DuckToken[];
  gain: GainNode;
  id: string;
  soundId: SoundId;
  source: AudioBufferSourceNode;
  startedAt: number;
  stop: (fadeMs?: number) => void;
};

type DuckToken = {
  bus: SoundBus;
  id: string;
  releaseMs: number;
};

type TransmuteRampNodes = {
  body: OscillatorNode;
  duckTokens: DuckToken[];
  gain: GainNode;
  grit: OscillatorNode;
  gritGain: GainNode;
};

type GatheringAttackChargeId =
  | "left-spark"
  | "right-spark"
  | "sum-strike"
  | "ember-burst"
  | "stone-crash";

type GatheringAttackChargeProfile = {
  accentEndRatio: number;
  accentGain: number;
  accentStartRatio: number;
  accentType: OscillatorType;
  bodyEndHz: number;
  bodyStartHz: number;
  bodyType: OscillatorType;
  lfoDepth: number;
  lfoHz: number;
  maxGain: number;
  musicDuckGain: number;
  rampCapMs: number;
  startGain: number;
};

type GatheringAttackChargeNodes = {
  accent: OscillatorNode;
  accentGain: GainNode;
  body: OscillatorNode;
  duckTokens: DuckToken[];
  gain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
  moveId: GatheringAttackChargeId;
};

type IntroHumProfile = {
  attackMs: number;
  bodyHz: number;
  bodyType: OscillatorType;
  lfoDepth: number;
  lfoHz: number;
  maxGain: number;
  overtoneGain: number;
  overtoneHz: number;
  releaseMs: number;
};

type IntroHumNodes = {
  body: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
  overtone: OscillatorNode;
  overtoneGain: GainNode;
};

export type SoundHandle = {
  finished: Promise<void>;
  id: string;
  soundId: SoundId;
  stop: (fadeMs?: number) => void;
};

export type SoundService = {
  cancelAll: (fadeMs?: number) => void;
  cancelBus: (bus: SoundBus, fadeMs?: number) => void;
  cancelSound: (soundId: SoundId, fadeMs?: number) => void;
  dispose: () => void;
  play: (soundId: SoundId, options?: SoundPlayOptions) => Promise<SoundHandle>;
  preload: (soundIds?: readonly SoundId[]) => Promise<void>;
  setBusVolume: (bus: SoundBus, volume: number) => void;
  setEnabled: (enabled: boolean) => void;
  setMasterVolume: (volume: number) => void;
  startIntroHum: () => void;
  startGatheringAttackCharge: (moveId: GatheringAttackChargeId) => void;
  startBackgroundMusic: () => Promise<SoundHandle>;
  stopBackgroundMusic: (fadeMs?: number) => void;
  stopGatheringAttackCharge: (fadeMs?: number) => void;
  stopIntroHum: (fadeMs?: number) => void;
  startTransmuteRamp: () => void;
  stopTransmuteRamp: (fadeMs?: number) => void;
  updateTransmuteRamp: (progress: number) => void;
};

const DEFAULT_BUS_GAIN: Record<SoundBus, number> = {
  ambience: 0.72,
  music: 0.72,
  sfx: 1,
  ui: 1,
  voice: 1,
};
const DEFAULT_BUS_PAN: Record<SoundBus, number> = {
  ambience: -0.03,
  music: -0.08,
  sfx: 0.08,
  ui: 0.04,
  voice: 0,
};
const MIN_GAIN = 0.0001;
const PUBLIC_URL_PROTOCOL_PATTERN = /^(blob:|data:|https?:)/;
const BACKGROUND_MUSIC_SOUND_ID = "music.crownIn8Bit" satisfies SoundId;
const BACKGROUND_MUSIC_UNLOCK_EVENTS = ["pointerdown", "keydown"] as const;
const DEFAULT_MUSIC_DUCKING = {
  attackMs: 8,
  bus: "music",
  gain: 0.92,
  holdMs: 22,
  releaseMs: 75,
} satisfies SoundDucking;
const MAX_MUSIC_DUCK_ATTACK_MS = 10;
const MAX_MUSIC_DUCK_HOLD_MS = 32;
const MAX_MUSIC_DUCK_RELEASE_MS = 90;
const MIN_MUSIC_DUCK_GAIN = 0.9;
const TRANSMUTE_RAMP_BUS: SoundBus = "sfx";
const TRANSMUTE_RAMP_MUSIC_DUCKING = {
  attackMs: 10,
  bus: "music",
  gain: 0.88,
  holdMs: 0,
  releaseMs: 90,
} satisfies SoundDucking;
const SOUND_OCTAVE_DOWN_FREQUENCY_RATIO = 0.5;
const TRANSMUTE_RAMP_BASE_GAIN = 0.1;
const TRANSMUTE_RAMP_MAX_GAIN = 0.46;
const TRANSMUTE_RAMP_BODY_MIN_HZ = 55;
const TRANSMUTE_RAMP_BODY_MAX_HZ = 275;
const TRANSMUTE_RAMP_GRIT_RATIO = 2;
const TRANSMUTE_RAMP_GRIT_MAX_GAIN = 0.34;
const GATHERING_ATTACK_CHARGE_BUS: SoundBus = "sfx";
const INTRO_HUM_BUS: SoundBus = "ambience";
const INTRO_HUM_PROFILE = {
  attackMs: 850,
  bodyHz: 44,
  bodyType: "sine",
  lfoDepth: 0.012,
  lfoHz: 0.18,
  maxGain: 0.16,
  overtoneGain: 0.025,
  overtoneHz: 88,
  releaseMs: 520,
} satisfies IntroHumProfile;
const GATHERING_ATTACK_CHARGE_AMBIENCE_DUCKING = {
  attackMs: 14,
  bus: "ambience",
  gain: 0.88,
  holdMs: 0,
  releaseMs: 130,
} satisfies SoundDucking;
const GATHERING_ATTACK_CHARGE_PROFILES = {
  "left-spark": {
    accentEndRatio: 2.1,
    accentGain: 0.12,
    accentStartRatio: 1.72,
    accentType: "square",
    bodyEndHz: 620,
    bodyStartHz: 140,
    bodyType: "sawtooth",
    lfoDepth: 0.018,
    lfoHz: 8.5,
    maxGain: 0.28,
    musicDuckGain: 0.84,
    rampCapMs: 1700,
    startGain: 0.055,
  },
  "right-spark": {
    accentEndRatio: 2.72,
    accentGain: 0.1,
    accentStartRatio: 2.18,
    accentType: "triangle",
    bodyEndHz: 760,
    bodyStartHz: 190,
    bodyType: "square",
    lfoDepth: 0.016,
    lfoHz: 6.25,
    maxGain: 0.25,
    musicDuckGain: 0.86,
    rampCapMs: 1900,
    startGain: 0.05,
  },
  "sum-strike": {
    accentEndRatio: 1.5,
    accentGain: 0.15,
    accentStartRatio: 1.26,
    accentType: "sawtooth",
    bodyEndHz: 420,
    bodyStartHz: 82,
    bodyType: "triangle",
    lfoDepth: 0.026,
    lfoHz: 4.75,
    maxGain: 0.34,
    musicDuckGain: 0.78,
    rampCapMs: 2400,
    startGain: 0.07,
  },
  "ember-burst": {
    accentEndRatio: 2.34,
    accentGain: 0.13,
    accentStartRatio: 1.84,
    accentType: "sawtooth",
    bodyEndHz: 540,
    bodyStartHz: 96,
    bodyType: "sawtooth",
    lfoDepth: 0.032,
    lfoHz: 7.4,
    maxGain: 0.32,
    musicDuckGain: 0.78,
    rampCapMs: 2200,
    startGain: 0.065,
  },
  "stone-crash": {
    accentEndRatio: 1.42,
    accentGain: 0.16,
    accentStartRatio: 1.12,
    accentType: "triangle",
    bodyEndHz: 220,
    bodyStartHz: 48,
    bodyType: "square",
    lfoDepth: 0.014,
    lfoHz: 3.2,
    maxGain: 0.36,
    musicDuckGain: 0.74,
    rampCapMs: 2600,
    startGain: 0.075,
  },
} satisfies Record<GatheringAttackChargeId, GatheringAttackChargeProfile>;
const noop = (): void => undefined;
type AudioContextConstructor = new (contextOptions?: AudioContextOptions) => AudioContext;
type BrowserAudioScope = {
  AudioContext?: unknown;
  webkitAudioContext?: unknown;
};

export function createSoundService(registry: readonly SoundDefinition[]): SoundService {
  const definitions = new Map<SoundId, SoundDefinition>(
    registry.map((definition) => [definition.id, definition]),
  );
  const bufferCache = new Map<SoundId, Promise<AudioBuffer | null>>();
  const activeVoices = new Map<string, Voice>();
  const busNodes = new Map<SoundBus, BusNodes>();
  const activeDucks = new Map<SoundBus, Map<string, number>>();
  const audioWarnings = new Set<string>();
  const missingAssets = new Set<SoundId>();
  let context: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;
  let transmuteRampNodes: TransmuteRampNodes | null = null;
  let gatheringAttackChargeNodes: GatheringAttackChargeNodes | null = null;
  let introHumNodes: IntroHumNodes | null = null;
  let introHumRequested = false;
  let cleanupIntroHumUnlockListeners: (() => void) | null = null;
  let backgroundMusicHandle: SoundHandle | null = null;
  let backgroundMusicPromise: Promise<SoundHandle> | null = null;
  let backgroundMusicRequested = false;
  let cleanupBackgroundMusicUnlockListeners: (() => void) | null = null;
  let voiceSequence = 0;
  let enabled = true;

  const getContext = (): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (context) return context;

    const AudioContextImplementation = getAudioContextConstructor(window);
    if (!AudioContextImplementation) {
      warnAudioOnce("context-unavailable", "sound: Web Audio API is unavailable in this browser.");
      return null;
    }

    try {
      context = new AudioContextImplementation({ latencyHint: "interactive" });
    } catch (error) {
      warnAudioOnce("context-create-failed", "sound: failed to create AudioContext.", error);
      context = null;
      return null;
    }

    masterGain = context.createGain();
    compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -12;
    compressor.knee.value = 18;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.16;
    masterGain.connect(compressor);
    compressor.connect(context.destination);

    return context;
  };

  const installBackgroundMusicUnlockListeners = (): void => {
    if (typeof window === "undefined" || cleanupBackgroundMusicUnlockListeners) return;

    const unlockAudio = () => {
      void unlockAudioAndStartRequestedSounds();
    };
    const listenerOptions = {
      capture: true,
      passive: true,
    } satisfies AddEventListenerOptions;
    for (const eventName of BACKGROUND_MUSIC_UNLOCK_EVENTS) {
      window.addEventListener(eventName, unlockAudio, listenerOptions);
    }

    cleanupBackgroundMusicUnlockListeners = () => {
      for (const eventName of BACKGROUND_MUSIC_UNLOCK_EVENTS) {
        window.removeEventListener(eventName, unlockAudio, listenerOptions);
      }
      cleanupBackgroundMusicUnlockListeners = null;
    };
  };

  const installIntroHumUnlockListeners = (): void => {
    if (typeof window === "undefined" || cleanupIntroHumUnlockListeners) return;

    const unlockAudio = () => {
      void unlockAudioAndStartRequestedSounds();
    };
    const listenerOptions = {
      capture: true,
      passive: true,
    } satisfies AddEventListenerOptions;
    for (const eventName of BACKGROUND_MUSIC_UNLOCK_EVENTS) {
      window.addEventListener(eventName, unlockAudio, listenerOptions);
    }

    cleanupIntroHumUnlockListeners = () => {
      for (const eventName of BACKGROUND_MUSIC_UNLOCK_EVENTS) {
        window.removeEventListener(eventName, unlockAudio, listenerOptions);
      }
      cleanupIntroHumUnlockListeners = null;
    };
  };

  const unlockAudioAndStartRequestedSounds = async (): Promise<void> => {
    const audioContext = getContext();
    if (!audioContext) return;

    if (audioContext.state !== "running") {
      try {
        await audioContext.resume();
      } catch (error) {
        warnAudioOnce("context-resume-failed", "sound: failed to resume AudioContext.", error);
        return;
      }
    }

    if (audioContext.state !== "running") return;

    cleanupBackgroundMusicUnlockListeners?.();
    cleanupIntroHumUnlockListeners?.();
    if (introHumRequested && enabled) startIntroHumNow();
    if (backgroundMusicRequested && enabled) void startBackgroundMusicNow();
  };

  const getBus = (bus: SoundBus): BusNodes | null => {
    const audioContext = getContext();
    if (!audioContext || !masterGain) return null;

    const existing = busNodes.get(bus);
    if (existing) return existing;

    const input = audioContext.createGain();
    const baseGain = audioContext.createGain();
    const duckGain = audioContext.createGain();
    const pan =
      typeof audioContext.createStereoPanner === "function"
        ? audioContext.createStereoPanner()
        : null;
    baseGain.gain.value = DEFAULT_BUS_GAIN[bus];
    duckGain.gain.value = 1;
    if (pan) {
      pan.pan.value = DEFAULT_BUS_PAN[bus];
    } else {
      warnAudioOnce(
        "stereo-panner-unavailable",
        "sound: StereoPannerNode is unavailable; continuing with centered audio.",
      );
    }
    input.connect(baseGain);
    baseGain.connect(duckGain);
    if (pan) {
      duckGain.connect(pan);
      pan.connect(masterGain);
    } else {
      duckGain.connect(masterGain);
    }

    const nodes: BusNodes = { baseGain, duckGain, input, pan };
    busNodes.set(bus, nodes);
    return nodes;
  };

  const loadBuffer = async (definition: SoundDefinition): Promise<AudioBuffer | null> => {
    const existing = bufferCache.get(definition.id);
    if (existing) return existing;

    const promise = (async () => {
      const audioContext = getContext();
      if (!audioContext) return null;

      const assetUrl = resolveSoundPublicUrl(definition.url);
      try {
        const response = await fetch(assetUrl);
        if (!response.ok) {
          warnMissingAsset(definition.id, assetUrl);
          return null;
        }
        const data = await response.arrayBuffer();
        return await audioContext.decodeAudioData(data);
      } catch (error) {
        warnMissingAsset(definition.id, assetUrl, error);
        return null;
      }
    })();

    bufferCache.set(definition.id, promise);
    return promise;
  };

  const warnMissingAsset = (soundId: SoundId, url: string, error?: unknown): void => {
    if (missingAssets.has(soundId)) return;
    missingAssets.add(soundId);
    console.warn(`sound: missing or undecodable asset for ${soundId} at ${url}`, error);
  };

  const warnAudioOnce = (key: string, message: string, error?: unknown): void => {
    if (audioWarnings.has(key)) return;
    audioWarnings.add(key);
    console.warn(message, error);
  };

  const applyReplayPolicy = (definition: SoundDefinition): boolean => {
    const matchingVoices = [...activeVoices.values()].filter(
      (voice) => voice.soundId === definition.id,
    );

    if (definition.replay === "ignore" && matchingVoices.length > 0) return false;
    if (definition.replay === "restart") cancelSound(definition.id, definition.interruptFadeMs);
    if (definition.replay === "cancel-bus") cancelBus(definition.bus, definition.interruptFadeMs);

    const remainingVoices = [...activeVoices.values()]
      .filter((voice) => voice.soundId === definition.id)
      .sort((a, b) => a.startedAt - b.startedAt);
    const overflow = remainingVoices.length - definition.maxVoices + 1;

    for (const voice of remainingVoices.slice(0, Math.max(0, overflow))) {
      voice.stop(definition.interruptFadeMs);
    }

    return true;
  };

  const getDuckingForDefinition = (definition: SoundDefinition): readonly SoundDucking[] => {
    if (definition.bus === "music") return definition.ducking;
    if (definition.ducking.some((duck) => duck.bus === "music")) {
      return definition.ducking.map(softenMusicDucking);
    }

    return [...definition.ducking, DEFAULT_MUSIC_DUCKING];
  };

  const startDucking = (voiceId: string, ducking: readonly SoundDucking[]): DuckToken[] => {
    const audioContext = getContext();
    if (!audioContext) return [];

    return ducking.map((duck) => {
      const token: DuckToken = {
        bus: duck.bus,
        id: `${voiceId}:${duck.bus}`,
        releaseMs: duck.releaseMs,
      };
      let busDucks = activeDucks.get(duck.bus);
      if (!busDucks) {
        busDucks = new Map();
        activeDucks.set(duck.bus, busDucks);
      }
      busDucks.set(token.id, duck.gain);
      rampDuckGain(duck.bus, duck.attackMs);
      return token;
    });
  };

  const releaseDucking = (tokens: readonly DuckToken[]): void => {
    for (const token of tokens) {
      const busDucks = activeDucks.get(token.bus);
      busDucks?.delete(token.id);
      rampDuckGain(token.bus, token.releaseMs);
    }
  };

  const rampDuckGain = (bus: SoundBus, durationMs: number): void => {
    const audioContext = getContext();
    const nodes = getBus(bus);
    if (!audioContext || !nodes) return;

    const busDucks = activeDucks.get(bus);
    const targetGain = busDucks && busDucks.size > 0 ? Math.min(...busDucks.values()) : 1;
    const now = audioContext.currentTime;
    nodes.duckGain.gain.cancelScheduledValues(now);
    nodes.duckGain.gain.setValueAtTime(nodes.duckGain.gain.value, now);
    nodes.duckGain.gain.linearRampToValueAtTime(targetGain, now + durationMs / 1000);
  };

  const stopVoice = (voice: Voice, fadeMs = 0): void => {
    const audioContext = getContext();
    if (!audioContext || !activeVoices.has(voice.id)) return;

    const now = audioContext.currentTime;
    const stopTime = now + fadeMs / 1000;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
    voice.gain.gain.linearRampToValueAtTime(MIN_GAIN, stopTime);
    voice.source.stop(stopTime + 0.01);
  };

  const cancelSound = (soundId: SoundId, fadeMs = 0): void => {
    for (const voice of activeVoices.values()) {
      if (voice.soundId === soundId) voice.stop(fadeMs);
    }
  };

  const cancelBus = (bus: SoundBus, fadeMs = 0): void => {
    for (const voice of activeVoices.values()) {
      if (voice.bus === bus) voice.stop(fadeMs);
    }
    if (bus === TRANSMUTE_RAMP_BUS) stopTransmuteRamp(fadeMs);
    if (bus === GATHERING_ATTACK_CHARGE_BUS) stopGatheringAttackCharge(fadeMs);
    if (bus === INTRO_HUM_BUS) stopIntroHumNodes(fadeMs);
  };

  const cancelAll = (fadeMs = 0): void => {
    for (const voice of activeVoices.values()) {
      voice.stop(fadeMs);
    }
    stopTransmuteRamp(fadeMs);
    stopGatheringAttackCharge(fadeMs);
    stopIntroHumNodes(fadeMs);
  };

  const resumeAudioContextForGesture = (audioContext: AudioContext): void => {
    if (audioContext.state === "running") {
      cleanupBackgroundMusicUnlockListeners?.();
      cleanupIntroHumUnlockListeners?.();
      if (introHumRequested && enabled) startIntroHumNow();
      if (backgroundMusicRequested && enabled) void startBackgroundMusicNow();
      return;
    }

    void audioContext
      .resume()
      .then(() => {
        if (audioContext.state !== "running") return;
        cleanupBackgroundMusicUnlockListeners?.();
        cleanupIntroHumUnlockListeners?.();
        if (introHumRequested && enabled) startIntroHumNow();
        if (backgroundMusicRequested && enabled) void startBackgroundMusicNow();
      })
      .catch((error: unknown) => {
        warnAudioOnce("context-resume-failed", "sound: failed to resume AudioContext.", error);
      });
  };

  const startTransmuteRamp = (): void => {
    if (!enabled) return;

    const audioContext = getContext();
    const bus = getBus(TRANSMUTE_RAMP_BUS);
    if (!audioContext || !bus) return;

    resumeAudioContextForGesture(audioContext);

    stopTransmuteRamp(0);

    const now = audioContext.currentTime;
    const duckTokens = startDucking("transmute-ramp", [TRANSMUTE_RAMP_MUSIC_DUCKING]);
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(TRANSMUTE_RAMP_BASE_GAIN, now + 0.04);
    gain.connect(bus.input);

    const body = audioContext.createOscillator();
    body.type = "triangle";
    body.frequency.setValueAtTime(
      TRANSMUTE_RAMP_BODY_MIN_HZ * SOUND_OCTAVE_DOWN_FREQUENCY_RATIO,
      now,
    );
    body.connect(gain);
    body.start(now);

    const gritGain = audioContext.createGain();
    gritGain.gain.setValueAtTime(0, now);
    gritGain.connect(gain);

    const grit = audioContext.createOscillator();
    grit.type = "sawtooth";
    grit.frequency.setValueAtTime(
      TRANSMUTE_RAMP_BODY_MIN_HZ * SOUND_OCTAVE_DOWN_FREQUENCY_RATIO * TRANSMUTE_RAMP_GRIT_RATIO,
      now,
    );
    grit.connect(gritGain);
    grit.start(now);

    transmuteRampNodes = { body, duckTokens, gain, grit, gritGain };
  };

  const startIntroHumNow = (): void => {
    if (introHumNodes || !enabled) return;

    const audioContext = getContext();
    const bus = getBus(INTRO_HUM_BUS);
    if (!audioContext || !bus || audioContext.state !== "running") return;

    const profile = INTRO_HUM_PROFILE;
    const now = audioContext.currentTime;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(MIN_GAIN, now);
    gain.gain.exponentialRampToValueAtTime(profile.maxGain, now + profile.attackMs / 1000);

    const filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(135, now);
    filter.Q.setValueAtTime(0.72, now);
    filter.connect(gain);
    gain.connect(bus.input);

    const body = audioContext.createOscillator();
    body.type = profile.bodyType;
    body.frequency.setValueAtTime(profile.bodyHz, now);
    body.connect(filter);

    const overtoneGain = audioContext.createGain();
    overtoneGain.gain.setValueAtTime(profile.overtoneGain, now);
    overtoneGain.connect(filter);

    const overtone = audioContext.createOscillator();
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(profile.overtoneHz, now);
    overtone.detune.setValueAtTime(-7, now);
    overtone.connect(overtoneGain);

    const lfoGain = audioContext.createGain();
    lfoGain.gain.setValueAtTime(profile.lfoDepth, now);
    lfoGain.connect(gain.gain);

    const lfo = audioContext.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(profile.lfoHz, now);
    lfo.connect(lfoGain);

    body.start(now);
    overtone.start(now);
    lfo.start(now);
    introHumNodes = { body, filter, gain, lfo, lfoGain, overtone, overtoneGain };
  };

  const startIntroHum = (): void => {
    introHumRequested = true;
    if (!enabled || typeof window === "undefined") return;

    installIntroHumUnlockListeners();
    const audioContext = getContext();
    if (!audioContext) return;
    if (audioContext.state === "running") {
      cleanupIntroHumUnlockListeners?.();
      startIntroHumNow();
    }
  };

  const startGatheringAttackCharge = (moveId: GatheringAttackChargeId): void => {
    if (!enabled) return;

    const audioContext = getContext();
    const bus = getBus(GATHERING_ATTACK_CHARGE_BUS);
    if (!audioContext || !bus) return;

    resumeAudioContextForGesture(audioContext);
    stopGatheringAttackCharge(24);

    const profile = getGatheringAttackChargeProfile(moveId);
    const now = audioContext.currentTime;
    const rampSeconds = profile.rampCapMs / 1000;
    const voiceId = `gathering-attack-charge:${moveId}`;
    const duckTokens = startDucking(voiceId, [
      {
        attackMs: 12,
        bus: "music",
        gain: profile.musicDuckGain,
        holdMs: 0,
        releaseMs: 150,
      },
      GATHERING_ATTACK_CHARGE_AMBIENCE_DUCKING,
    ]);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(MIN_GAIN, now);
    gain.gain.exponentialRampToValueAtTime(profile.startGain, now + 0.045);
    gain.gain.linearRampToValueAtTime(profile.maxGain, now + rampSeconds);
    gain.connect(bus.input);

    const body = audioContext.createOscillator();
    body.type = profile.bodyType;
    body.frequency.setValueAtTime(profile.bodyStartHz, now);
    body.frequency.exponentialRampToValueAtTime(profile.bodyEndHz, now + rampSeconds);
    body.connect(gain);

    const accentGain = audioContext.createGain();
    accentGain.gain.setValueAtTime(MIN_GAIN, now);
    accentGain.gain.exponentialRampToValueAtTime(profile.accentGain, now + rampSeconds);
    accentGain.connect(gain);

    const accent = audioContext.createOscillator();
    accent.type = profile.accentType;
    accent.frequency.setValueAtTime(profile.bodyStartHz * profile.accentStartRatio, now);
    accent.frequency.exponentialRampToValueAtTime(
      profile.bodyEndHz * profile.accentEndRatio,
      now + rampSeconds,
    );
    accent.connect(accentGain);

    const lfoGain = audioContext.createGain();
    lfoGain.gain.setValueAtTime(0, now);
    lfoGain.gain.linearRampToValueAtTime(profile.lfoDepth, now + rampSeconds);
    lfoGain.connect(gain.gain);

    const lfo = audioContext.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(profile.lfoHz, now);
    lfo.connect(lfoGain);

    body.start(now);
    accent.start(now);
    lfo.start(now);

    gatheringAttackChargeNodes = {
      accent,
      accentGain,
      body,
      duckTokens,
      gain,
      lfo,
      lfoGain,
      moveId,
    };
  };

  const updateTransmuteRamp = (progress: number): void => {
    const audioContext = getContext();
    const nodes = transmuteRampNodes;
    if (!audioContext || !nodes) return;

    const boundedProgress = clamp(progress, 0, 1);
    const frequency =
      (TRANSMUTE_RAMP_BODY_MIN_HZ +
        boundedProgress * (TRANSMUTE_RAMP_BODY_MAX_HZ - TRANSMUTE_RAMP_BODY_MIN_HZ)) *
      SOUND_OCTAVE_DOWN_FREQUENCY_RATIO;
    const gain =
      TRANSMUTE_RAMP_BASE_GAIN +
      boundedProgress * (TRANSMUTE_RAMP_MAX_GAIN - TRANSMUTE_RAMP_BASE_GAIN);
    const now = audioContext.currentTime;

    nodes.body.frequency.setTargetAtTime(frequency, now, 0.04);
    nodes.grit.frequency.setTargetAtTime(frequency * TRANSMUTE_RAMP_GRIT_RATIO, now, 0.04);
    nodes.gain.gain.setTargetAtTime(gain, now, 0.04);
    nodes.gritGain.gain.setTargetAtTime(
      boundedProgress * boundedProgress * TRANSMUTE_RAMP_GRIT_MAX_GAIN,
      now,
      0.05,
    );
  };

  const stopTransmuteRamp = (fadeMs = 80): void => {
    const nodes = transmuteRampNodes;
    if (!nodes) return;

    const audioContext = getContext();
    if (!audioContext) return;

    transmuteRampNodes = null;
    releaseDucking(nodes.duckTokens);
    const now = audioContext.currentTime;
    const stopTime = now + fadeMs / 1000;
    nodes.gain.gain.cancelScheduledValues(now);
    nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
    nodes.gain.gain.linearRampToValueAtTime(MIN_GAIN, stopTime);
    nodes.body.stop(stopTime + 0.04);
    nodes.grit.stop(stopTime + 0.04);
    nodes.body.addEventListener("ended", () => {
      nodes.body.disconnect();
      nodes.grit.disconnect();
      nodes.gritGain.disconnect();
      nodes.gain.disconnect();
    });
  };

  const stopGatheringAttackCharge = (fadeMs = 90): void => {
    const nodes = gatheringAttackChargeNodes;
    if (!nodes) return;

    const audioContext = getContext();
    if (!audioContext) return;

    gatheringAttackChargeNodes = null;
    releaseDucking(nodes.duckTokens);
    const now = audioContext.currentTime;
    const stopTime = now + fadeMs / 1000;
    nodes.gain.gain.cancelScheduledValues(now);
    nodes.gain.gain.setValueAtTime(Math.max(nodes.gain.gain.value, MIN_GAIN), now);
    nodes.gain.gain.linearRampToValueAtTime(MIN_GAIN, stopTime);
    nodes.accentGain.gain.cancelScheduledValues(now);
    nodes.accentGain.gain.setValueAtTime(Math.max(nodes.accentGain.gain.value, MIN_GAIN), now);
    nodes.accentGain.gain.linearRampToValueAtTime(MIN_GAIN, stopTime);
    nodes.lfoGain.gain.cancelScheduledValues(now);
    nodes.lfoGain.gain.setValueAtTime(nodes.lfoGain.gain.value, now);
    nodes.lfoGain.gain.linearRampToValueAtTime(0, stopTime);
    nodes.body.stop(stopTime + 0.04);
    nodes.accent.stop(stopTime + 0.04);
    nodes.lfo.stop(stopTime + 0.04);
    nodes.body.addEventListener("ended", () => {
      nodes.body.disconnect();
      nodes.accent.disconnect();
      nodes.accentGain.disconnect();
      nodes.lfo.disconnect();
      nodes.lfoGain.disconnect();
      nodes.gain.disconnect();
    });
  };

  const stopIntroHumNodes = (fadeMs = INTRO_HUM_PROFILE.releaseMs): void => {
    const nodes = introHumNodes;
    if (!nodes) return;

    const audioContext = getContext();
    introHumNodes = null;
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const stopTime = now + fadeMs / 1000;
    nodes.gain.gain.cancelScheduledValues(now);
    nodes.gain.gain.setValueAtTime(Math.max(nodes.gain.gain.value, MIN_GAIN), now);
    nodes.gain.gain.exponentialRampToValueAtTime(MIN_GAIN, Math.max(stopTime, now + 0.01));
    nodes.body.stop(stopTime + 0.04);
    nodes.overtone.stop(stopTime + 0.04);
    nodes.lfo.stop(stopTime + 0.04);
    nodes.body.addEventListener("ended", () => {
      nodes.body.disconnect();
      nodes.overtone.disconnect();
      nodes.overtoneGain.disconnect();
      nodes.lfo.disconnect();
      nodes.lfoGain.disconnect();
      nodes.filter.disconnect();
      nodes.gain.disconnect();
    });
  };

  const stopIntroHum = (fadeMs = INTRO_HUM_PROFILE.releaseMs): void => {
    introHumRequested = false;
    cleanupIntroHumUnlockListeners?.();
    stopIntroHumNodes(fadeMs);
  };

  const startBackgroundMusicNow = async (): Promise<SoundHandle> => {
    if (backgroundMusicHandle) return backgroundMusicHandle;
    if (backgroundMusicPromise) return backgroundMusicPromise;

    backgroundMusicPromise = (async () => {
      const handle = await play(BACKGROUND_MUSIC_SOUND_ID);
      if (!backgroundMusicRequested) {
        handle.stop(0);
        return handle;
      }
      if (!handle.id.startsWith("noop:")) {
        backgroundMusicHandle = handle;
        void handle.finished.then(() => {
          if (backgroundMusicHandle?.id === handle.id) backgroundMusicHandle = null;
        });
      }
      return handle;
    })();

    try {
      return await backgroundMusicPromise;
    } finally {
      backgroundMusicPromise = null;
    }
  };

  const startBackgroundMusic = async (): Promise<SoundHandle> => {
    backgroundMusicRequested = true;
    if (!enabled || typeof window === "undefined")
      return createNoopHandle(BACKGROUND_MUSIC_SOUND_ID);

    installBackgroundMusicUnlockListeners();
    if (context?.state !== "running") return createNoopHandle(BACKGROUND_MUSIC_SOUND_ID);

    return startBackgroundMusicNow();
  };

  const stopBackgroundMusic = (fadeMs = 300): void => {
    backgroundMusicRequested = false;
    cleanupBackgroundMusicUnlockListeners?.();
    backgroundMusicHandle?.stop(fadeMs);
    backgroundMusicHandle = null;
    cancelSound(BACKGROUND_MUSIC_SOUND_ID, fadeMs);
  };

  const play = async (soundId: SoundId, options: SoundPlayOptions = {}): Promise<SoundHandle> => {
    const parsedOptions = SoundPlayOptionsSchema.parse(options);
    const definition = definitions.get(soundId);
    if (!definition || !enabled || !applyReplayPolicy(definition)) return createNoopHandle(soundId);

    const audioContext = getContext();
    const bus = getBus(definition.bus);
    if (!audioContext || !bus) return createNoopHandle(soundId);

    if (audioContext.state !== "running") {
      try {
        await audioContext.resume();
      } catch (error) {
        warnAudioOnce("context-resume-failed", "sound: failed to resume AudioContext.", error);
        return createNoopHandle(soundId);
      }
    }

    if (audioContext.state !== "running") return createNoopHandle(soundId);

    cleanupBackgroundMusicUnlockListeners?.();
    cleanupIntroHumUnlockListeners?.();
    if (introHumRequested) startIntroHumNow();
    if (backgroundMusicRequested && soundId !== BACKGROUND_MUSIC_SOUND_ID) {
      void startBackgroundMusicNow();
    }

    const buffer = await loadBuffer(definition);
    if (!buffer) return createNoopHandle(soundId);

    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    const startedAt = audioContext.currentTime;
    const voiceId = `${soundId}:${voiceSequence}`;
    voiceSequence += 1;
    source.buffer = buffer;
    source.detune.value = definition.detuneCents + (parsedOptions.detuneCents ?? 0);
    source.loop = definition.loop;
    gain.gain.value = definition.volume * (parsedOptions.volume ?? 1);
    source.connect(gain);
    gain.connect(bus.input);

    let resolveFinished = noop;
    const finished = new Promise<void>((resolve) => {
      resolveFinished = resolve;
    });
    const duckTokens = startDucking(voiceId, getDuckingForDefinition(definition));
    const voice: Voice = {
      bus: definition.bus,
      duckTokens,
      gain,
      id: voiceId,
      soundId,
      source,
      startedAt,
      stop: (fadeMs?: number) => stopVoice(voice, fadeMs),
    };
    activeVoices.set(voiceId, voice);
    source.onended = () => {
      activeVoices.delete(voiceId);
      releaseDucking(voice.duckTokens);
      source.disconnect();
      gain.disconnect();
      resolveFinished();
    };
    source.start(audioContext.currentTime + (parsedOptions.delayMs ?? 0) / 1000);

    return {
      finished,
      id: voiceId,
      soundId,
      stop: voice.stop,
    };
  };

  return {
    cancelAll,
    cancelBus,
    cancelSound,
    dispose() {
      cancelAll();
      stopTransmuteRamp();
      stopGatheringAttackCharge();
      stopIntroHum(0);
      cleanupBackgroundMusicUnlockListeners?.();
      busNodes.clear();
      activeDucks.clear();
      bufferCache.clear();
      backgroundMusicHandle = null;
      backgroundMusicPromise = null;
      backgroundMusicRequested = false;
      if (context) void context.close();
      context = null;
      masterGain = null;
      compressor = null;
    },
    play,
    async preload(soundIds = [...definitions.keys()]) {
      await Promise.all(
        soundIds.map(async (soundId) => {
          const definition = definitions.get(soundId);
          if (definition) await loadBuffer(definition);
        }),
      );
    },
    setBusVolume(bus, volume) {
      const nodes = getBus(bus);
      const audioContext = getContext();
      if (!nodes || !audioContext) return;

      const now = audioContext.currentTime;
      nodes.baseGain.gain.cancelScheduledValues(now);
      nodes.baseGain.gain.setTargetAtTime(clamp(volume, 0, 2), now, 0.016);
    },
    setEnabled(nextEnabled) {
      enabled = nextEnabled;
      if (!enabled) cancelAll(40);
      if (enabled && backgroundMusicRequested) void startBackgroundMusic();
      if (enabled && introHumRequested) startIntroHum();
    },
    setMasterVolume(volume) {
      const audioContext = getContext();
      if (!audioContext || !masterGain) return;

      const now = audioContext.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(clamp(volume, 0, 2), now, 0.016);
    },
    startIntroHum,
    startGatheringAttackCharge,
    startBackgroundMusic,
    stopBackgroundMusic,
    stopGatheringAttackCharge,
    stopIntroHum,
    startTransmuteRamp,
    stopTransmuteRamp,
    updateTransmuteRamp,
  };
}

function createNoopHandle(soundId: SoundId): SoundHandle {
  return {
    finished: Promise.resolve(),
    id: `noop:${soundId}`,
    soundId,
    stop: noop,
  };
}

function softenMusicDucking(ducking: SoundDucking): SoundDucking {
  if (ducking.bus !== "music") return ducking;

  return {
    ...ducking,
    attackMs: Math.min(ducking.attackMs, MAX_MUSIC_DUCK_ATTACK_MS),
    gain: Math.max(ducking.gain, MIN_MUSIC_DUCK_GAIN),
    holdMs: Math.min(ducking.holdMs, MAX_MUSIC_DUCK_HOLD_MS),
    releaseMs: Math.min(ducking.releaseMs, MAX_MUSIC_DUCK_RELEASE_MS),
  };
}

export function getAudioContextConstructor(
  scope: BrowserAudioScope,
): AudioContextConstructor | null {
  if (isAudioContextConstructor(scope.AudioContext)) return scope.AudioContext;
  if (isAudioContextConstructor(scope.webkitAudioContext)) return scope.webkitAudioContext;
  return null;
}

function isAudioContextConstructor(value: unknown): value is AudioContextConstructor {
  return typeof value === "function";
}

export function resolveSoundPublicUrl(url: string, baseUrl = import.meta.env.BASE_URL): string {
  if (PUBLIC_URL_PROTOCOL_PATTERN.test(url)) return url;

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedUrl = url.startsWith("/") ? url.slice(1) : url;

  return `${normalizedBaseUrl}${normalizedUrl}`;
}

export function getGatheringAttackChargeProfile(
  moveId: GatheringAttackChargeId,
): GatheringAttackChargeProfile {
  return GATHERING_ATTACK_CHARGE_PROFILES[moveId];
}

export function getGatheringAttackChargeProgress(
  moveId: GatheringAttackChargeId,
  elapsedMs: number,
): number {
  const profile = getGatheringAttackChargeProfile(moveId);
  return clamp(elapsedMs / profile.rampCapMs, 0, 1);
}

export function getIntroHumProfile(): IntroHumProfile {
  return INTRO_HUM_PROFILE;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
