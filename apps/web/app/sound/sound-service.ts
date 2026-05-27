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
  pan: StereoPannerNode;
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
  startBackgroundMusic: () => Promise<SoundHandle>;
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
const noop = (): void => undefined;

export function createSoundService(registry: readonly SoundDefinition[]): SoundService {
  const definitions = new Map<SoundId, SoundDefinition>(
    registry.map((definition) => [definition.id, definition]),
  );
  const bufferCache = new Map<SoundId, Promise<AudioBuffer | null>>();
  const activeVoices = new Map<string, Voice>();
  const busNodes = new Map<SoundBus, BusNodes>();
  const activeDucks = new Map<SoundBus, Map<string, number>>();
  const missingAssets = new Set<SoundId>();
  let context: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;
  let transmuteRampNodes: TransmuteRampNodes | null = null;
  let backgroundMusicHandle: SoundHandle | null = null;
  let backgroundMusicPromise: Promise<SoundHandle> | null = null;
  let backgroundMusicRequested = false;
  let cleanupBackgroundMusicUnlockListeners: (() => void) | null = null;
  let voiceSequence = 0;
  let enabled = true;

  const getContext = (): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (context) return context;

    context = new AudioContext({ latencyHint: "interactive" });
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
      void unlockAudioAndStartRequestedMusic();
    };
    const listenerOptions = {
      capture: true,
      once: true,
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

  const unlockAudioAndStartRequestedMusic = async (): Promise<void> => {
    const audioContext = getContext();
    if (!audioContext) return;

    if (audioContext.state !== "running") {
      try {
        await audioContext.resume();
      } catch {
        return;
      }
    }

    if (audioContext.state !== "running") return;

    cleanupBackgroundMusicUnlockListeners?.();
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
    const pan = audioContext.createStereoPanner();
    baseGain.gain.value = DEFAULT_BUS_GAIN[bus];
    duckGain.gain.value = 1;
    pan.pan.value = DEFAULT_BUS_PAN[bus];
    input.connect(baseGain);
    baseGain.connect(duckGain);
    duckGain.connect(pan);
    pan.connect(masterGain);

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

      try {
        const response = await fetch(resolvePublicUrl(definition.url));
        if (!response.ok) {
          warnMissingAsset(definition.id, definition.url);
          return null;
        }
        const data = await response.arrayBuffer();
        return await audioContext.decodeAudioData(data);
      } catch (error) {
        warnMissingAsset(definition.id, definition.url, error);
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
  };

  const cancelAll = (fadeMs = 0): void => {
    for (const voice of activeVoices.values()) {
      voice.stop(fadeMs);
    }
    stopTransmuteRamp(fadeMs);
  };

  const startTransmuteRamp = (): void => {
    if (!enabled) return;

    const audioContext = getContext();
    const bus = getBus(TRANSMUTE_RAMP_BUS);
    if (!audioContext || !bus) return;

    if (audioContext.state !== "running") {
      void audioContext.resume();
    }

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

  const startBackgroundMusicNow = async (): Promise<SoundHandle> => {
    if (backgroundMusicHandle) return backgroundMusicHandle;
    if (backgroundMusicPromise) return backgroundMusicPromise;

    backgroundMusicPromise = (async () => {
      const handle = await play(BACKGROUND_MUSIC_SOUND_ID);
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
      } catch {
        return createNoopHandle(soundId);
      }
    }

    if (audioContext.state !== "running") return createNoopHandle(soundId);

    cleanupBackgroundMusicUnlockListeners?.();
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
    },
    setMasterVolume(volume) {
      const audioContext = getContext();
      if (!audioContext || !masterGain) return;

      const now = audioContext.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(clamp(volume, 0, 2), now, 0.016);
    },
    startBackgroundMusic,
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

function resolvePublicUrl(url: string): string {
  if (PUBLIC_URL_PROTOCOL_PATTERN.test(url)) return url;

  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const normalizedUrl = url.startsWith("/") ? url.slice(1) : url;

  return `${baseUrl}${normalizedUrl}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
