/* eslint-disable */

/*
 In this example you'll see:
 - time and animation
 - using an array to switch between modes
 - lambda style function expressions
 - Another way to make a mode switch timer
*/
export var TRIGGER_LIGHTNING
export var TRIGGER_SEGMENT_CHANGE
export var CURRENT_SEGMENT
export var PREVIOUS_SEGMENT
export var FADE_IN_PROGRESS=0
export var FADE_PERCENT
var SEGMENT_TRIGGER_TIMER
var ONE_MINUS_FADE_PERCENT
export var hsv1 = array(3)
export var hsv2 = array(3)
export var blendHsv = array(3)

numSegments = 2 // Keep track of how many modes there will be
segmentHSVs = array(numSegments) // Make an array to store the modes
segmentPatterns = array(numSegments) // Make an array to store the modes

for (i = 0; i < numSegments; i++) {
  segmentHSVs[i] = array(3)
}


export function segment0() {
  segmentHSVs[0][0]=1
  segmentHSVs[0][1]=1
  segmentHSVs[0][2]=1
  
}

export function segment1() {
  segmentHSVs[1][0]=0.5
  segmentHSVs[1][1]=1
  segmentHSVs[1][2]=1
}

segmentPatterns[0] = segment0
segmentPatterns[1] = segment1

export function blendSegments(pattern1,pattern2) {
  FADE_PERCENT = FADE_PERCENT + 0.00005
  ONE_MINUS_FADE_PERCENT = 1-FADE_PERCENT
  h = segmentHSVs[pattern1][0] * ONE_MINUS_FADE_PERCENT + segmentHSVs[pattern2][0] * FADE_PERCENT
  s = segmentHSVs[pattern1][1] * ONE_MINUS_FADE_PERCENT + segmentHSVs[pattern2][1] * FADE_PERCENT
  v = (segmentHSVs[pattern1][2] * ONE_MINUS_FADE_PERCENT + segmentHSVs[pattern2][2] * FADE_PERCENT) * abs(0.5-FADE_PERCENT)
  
  blendHsv[0] = h
  blendHsv[1] = s
  blendHsv[2] = v
  
}


export function fadeBlackBetweenSegments(pattern1,pattern2) {
  FADE_PERCENT = FADE_PERCENT + 0.00005
  ONE_MINUS_FADE_PERCENT = 1-FADE_PERCENT
  v = (segmentHSVs[pattern1][2] * ONE_MINUS_FADE_PERCENT + segmentHSVs[pattern2][2] * FADE_PERCENT) * abs(0.5-FADE_PERCENT)
  if (FADE_PERCENT < 0.5) {
  h = segmentHSVs[pattern1][0] 
  s = segmentHSVs[pattern1][1]
  } else {
  h = segmentHSVs[pattern2][0] 
  s =  segmentHSVs[pattern2][1]
  }
  
  blendHsv[0] = h
  blendHsv[1] = s
  blendHsv[2] = v
  
}


export function changeSegments() {
  if (CURRENT_SEGMENT==1) {
    CURRENT_SEGMENT=0
    PREVIOUS_SEGMENT=1
  } else {
    CURRENT_SEGMENT=1
    PREVIOUS_SEGMENT=0
  }
}

/* 
  The beforeRender function is called once before each animation frame
  and is passed a delta in fractional milliseconds since the last frame.
  This has very high resolution, down to 6.25 nanoseconds!
*/
export function beforeRender(delta) {
  SEGMENT_TRIGGER_TIMER=time(0.14)
  if (SEGMENT_TRIGGER_TIMER < 0.01 && FADE_IN_PROGRESS==0) {
    TRIGGER_SEGMENT_CHANGE=1
  }
  if (TRIGGER_SEGMENT_CHANGE==1) {
    changeSegments()
    TRIGGER_SEGMENT_CHANGE=0
    FADE_PERCENT=0
    FADE_IN_PROGRESS=1
  }
  if (FADE_PERCENT >= 1) {
    FADE_IN_PROGRESS=0
  }

}

/*
  The render function is called for every pixel. hsv() "wraps" hue between 0.0 and 1.0.
*/
export function render(index) {
  if (FADE_IN_PROGRESS==1) {
    segmentPatterns[PREVIOUS_SEGMENT]()
    segmentPatterns[CURRENT_SEGMENT]()
    fadeBlackBetweenSegments(PREVIOUS_SEGMENT,CURRENT_SEGMENT)
    hsv(blendHsv[0],blendHsv[1],blendHsv[2])
  } else {
    segmentPatterns[CURRENT_SEGMENT]()
    hsv(segmentHSVs[CURRENT_SEGMENT][0],segmentHSVs[CURRENT_SEGMENT][1],segmentHSVs[CURRENT_SEGMENT][2])
  }
}