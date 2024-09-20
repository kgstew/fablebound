
export var TRIGGER_LIGHTNING=1
export var LIGHTNING_IN_PROGRESS=0
export var LIGHTNING_PERCENT

before the last preRenders[]= line in  prerender: 


if (LIGHTNING_IN_PROGRESS) {
    LIGHTNING_PERCENT += 0.5
    if (LIGHTNING_PERCENT >= 1.0) {
      LIGHTNING_IN_PROGRESS=0
      LIGHTNING_PERCENT=0
    }
  }
  if (TRIGGER_LIGHTNING) {
    LIGHTNING_IN_PROGRESS=1
    LIGHTNING_PERCENT=0.0
    TRIGGER_LIGHTNING=0
  }


at the end of render:

if (LIGHTNING_IN_PROGRESS) {
    hsv(1,0,1)
  }