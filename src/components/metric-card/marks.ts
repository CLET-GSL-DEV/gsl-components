import adinkraHene from "./assets/adinkra-hene.png?no-inline";
import akofena from "./assets/akofena.png?no-inline";
import akokoNan from "./assets/akoko-nan.png?no-inline";
import akomaNtoaso from "./assets/akoma-ntoaso.png?no-inline";
import epa from "./assets/epa.png?no-inline";
import hwemudua from "./assets/hwemudua.png?no-inline";
import mateMasie from "./assets/mate-masie.png?no-inline";
import mpuannum from "./assets/mpuannum.png?no-inline";
import nkyimkyim from "./assets/nkyimkyim.png?no-inline";
import nkyimu from "./assets/nkyimu.png?no-inline";
import nyansapo from "./assets/nyansapo.png?no-inline";
import oheneAdwa from "./assets/ohene-adwa.png?no-inline";
import oheneAniwa from "./assets/ohene-aniwa.png?no-inline";
import okodeeMmowere from "./assets/okodee-mmowere.png?no-inline";
import osramNeNsroma from "./assets/osram-ne-nsroma.png?no-inline";
import sepow from "./assets/sepow.png?no-inline";
import type { MetricCardMark } from "../../types/metric-card";

/** Order matters: `pickMark` indexes into MARK_IDS. Append new ones at the end. */
export const MARKS: Record<MetricCardMark, string> = {
  "adinkra-hene": adinkraHene,
  akofena,
  "akoko-nan": akokoNan,
  "akoma-ntoaso": akomaNtoaso,
  epa,
  hwemudua,
  "mate-masie": mateMasie,
  mpuannum,
  nkyimkyim,
  nkyimu,
  nyansapo,
  "ohene-adwa": oheneAdwa,
  "ohene-aniwa": oheneAniwa,
  "okodee-mmowere": okodeeMmowere,
  "osram-ne-nsroma": osramNeNsroma,
  sepow,
};

export const MARK_IDS = Object.keys(MARKS) as MetricCardMark[];

/** FNV-1a, so the same label always draws the same mark. */
export function pickMark(seed: string): MetricCardMark {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return MARK_IDS[hash % MARK_IDS.length];
}
