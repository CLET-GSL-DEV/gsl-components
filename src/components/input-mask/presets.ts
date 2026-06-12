export const INPUT_MASK_PRESETS = {
  phoneGh: "0## ### ####",
  phoneIntlGh: "+233 ## ### ####",
  date: "##/##/####",
  time: "##:##",
} as const;

export type InputMaskPreset = (typeof INPUT_MASK_PRESETS)[keyof typeof INPUT_MASK_PRESETS];
