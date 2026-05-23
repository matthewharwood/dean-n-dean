import { SOUND_REGISTRY } from "./registry";
import { createSoundService } from "./sound-service";

export const sfx = createSoundService(SOUND_REGISTRY);
