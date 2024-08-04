/* eslint-disable */

export var PIXELBLAZE_NUMBER = 0
export var TRIGGER_SEGMENT_CHANGE
export var CURRENT_SEGMENT
export var PREVIOUS_SEGMENT
export var FADE_IN_PROGRESS = 0
export var FADE_PERCENT
var SEGMENT_TRIGGER_TIMER
var ONE_MINUS_FADE_PERCENT
export var hsv1 = array(3)
export var hsv2 = array(3)
export var blendHsv = array(3)

numPixelblazes = 4
numSegmentsPerPixelblaze = 2
segmentHSVs = array(numPixelblazes)
segmentPatterns = array(numPixelblazes)

for (i = 0; i < numPixelblazes; i++) {
  segmentHSVs[i] = array(numSegmentsPerPixelblaze)
  segmentPatterns[i] = array(numSegmentsPerPixelblaze)
  for (j = 0; j < numSegmentsPerPixelblaze; j++) {
    segmentHSVs[i][j] = array(3)
  }
}




// Pixelblaze 0 - Rails and uplighting
// Segment 0 - Portal
export function preRender0_0() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }

export function segment0_0() {
    segmentHSVs[0][0][0] = 1
    segmentHSVs[0][0][1] = 1
    segmentHSVs[0][0][2] = 1
}



// Pixelblaze 0 - Rails and uplighting
// Segment 1 - Left Shield
export function preRender0_1() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment0_1() {
    segmentHSVs[0][1][0] = 0.5
    segmentHSVs[0][1][1] = 1
    segmentHSVs[0][1][2] = 1
}

// Pixelblaze 0 - Rails and uplighting
// Segment 2 - Right Shield
export function preRender0_2() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment0_2() {
    segmentHSVs[0][2][0] = 0.25
    segmentHSVs[0][2][1] = 1
    segmentHSVs[0][2][2] = 1
}

// Pixelblaze 0 - Rails and uplighting
// Segment 3 - Left Accent
export function preRender0_3() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment0_3() {
    segmentHSVs[0][3][0] = 0.75
    segmentHSVs[0][3][1] = 1
    segmentHSVs[0][3][2] = 1
}

// Pixelblaze 0 - Rails and uplighting
// Segment 4 - Right Accent
export function preRender0_4() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment0_4() {
    segmentHSVs[0][4][0] = 0.1
    segmentHSVs[0][4][1] = 1
    segmentHSVs[0][4][2] = 1
}

// Pixelblaze 0 - Rails and uplighting
// Segment 5 - Left Detail
export function preRender0_5() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment0_5() {
    segmentHSVs[0][5][0] = 0.6
    segmentHSVs[0][5][1] = 1
    segmentHSVs[0][5][2] = 1
}

// Pixelblaze 0 - Rails and uplighting
// Segment 6 - Right Detail
export function preRender0_6() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment0_6() {
    segmentHSVs[0][6][0] = 0.35
    segmentHSVs[0][6][1] = 1
    segmentHSVs[0][6][2] = 1
}

// Pixelblaze 0 - Rails and uplighting
// Segment 7 - Base
export function preRender0_7() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment0_7() {
    segmentHSVs[0][7][0] = 0.85
    segmentHSVs[0][7][1] = 1
    segmentHSVs[0][7][2] = 1
}

// Pixelblaze 1 - Shields
// Segment 0 - Front Center
export function preRender1_0() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment1_0() {
    segmentHSVs[1][0][0] = 0.2
    segmentHSVs[1][0][1] = 1
    segmentHSVs[1][0][2] = 1
}



// Pixelblaze 1 - Shields
// Segment 1 - Left Shield
export function preRender1_1() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment1_1() {
    segmentHSVs[0][1][0] = 0.5
    segmentHSVs[0][1][1] = 1
    segmentHSVs[0][1][2] = 1
}

// Pixelblaze 1 - Shields
// Segment 2 - Right Shield
export function preRender1_2() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment1_2() {
    segmentHSVs[0][2][0] = 0.25
    segmentHSVs[0][2][1] = 1
    segmentHSVs[0][2][2] = 1
}

// Pixelblaze 1 - Shields
// Segment 3 - Left Accent
export function preRender1_3() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment1_3() {
    segmentHSVs[0][3][0] = 0.75
    segmentHSVs[0][3][1] = 1
    segmentHSVs[0][3][2] = 1
}

// Pixelblaze 1 - Shields
// Segment 4 - Right Accent
export function preRender1_4() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment1_4() {
    segmentHSVs[0][4][0] = 0.1
    segmentHSVs[0][4][1] = 1
    segmentHSVs[0][4][2] = 1
}

// Pixelblaze 1 - Shields
// Segment 5 - Left Detail
export function preRender1_5() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment1_5() {
    segmentHSVs[0][5][0] = 0.6
    segmentHSVs[0][5][1] = 1
    segmentHSVs[0][5][2] = 1
}

// Pixelblaze 1 - Shields
// Segment 6 - Right Detail
export function preRender1_6() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment1_6() {
    segmentHSVs[0][6][0] = 0.35
    segmentHSVs[0][6][1] = 1
    segmentHSVs[0][6][2] = 1
}

// Pixelblaze 1 - Shields
// Segment 7 - Base
export function preRender1_7() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment1_7() {
    segmentHSVs[0][7][0] = 0.85
    segmentHSVs[0][7][1] = 1
    segmentHSVs[0][7][2] = 1
}


// Pixelblaze 2 - Rail UV and Rail RGB
// Segment 0 - Portal
export function preRender2_0() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment2_0() {
    segmentHSVs[0][0][0] = 1
    segmentHSVs[0][0][1] = 1
    segmentHSVs[0][0][2] = 1
}

// Pixelblaze 2 - Rail UV and Rail RGB
// Segment 1 - Left Shield
export function preRender2_1() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment2_1() {
    segmentHSVs[0][1][0] = 0.5
    segmentHSVs[0][1][1] = 1
    segmentHSVs[0][1][2] = 1
}

// Pixelblaze 2 - Rail UV and Rail RGB
// Segment 2 - Right Shield
export function preRender2_2() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment2_2() {
    segmentHSVs[0][2][0] = 0.25
    segmentHSVs[0][2][1] = 1
    segmentHSVs[0][2][2] = 1
}

// Pixelblaze 2 - Rail UV and Rail RGB
// Segment 3 - Left Accent
export function preRender2_3() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment2_3() {
    segmentHSVs[0][3][0] = 0.75
    segmentHSVs[0][3][1] = 1
    segmentHSVs[0][3][2] = 1
}

// Pixelblaze 2 - Rail UV and Rail RGB
// Segment 4 - Right Accent
export function preRender2_4() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment2_4() {
    segmentHSVs[0][4][0] = 0.1
    segmentHSVs[0][4][1] = 1
    segmentHSVs[0][4][2] = 1
}

// Pixelblaze 2 - Rail UV and Rail RGB
// Segment 5 - Left Detail
export function preRender2_5() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment2_5() {
    segmentHSVs[0][5][0] = 0.6
    segmentHSVs[0][5][1] = 1
    segmentHSVs[0][5][2] = 1
}

// Pixelblaze 2 - Rail UV and Rail RGB
// Segment 6 - Right Detail
export function preRender2_6() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment2_6() {
    segmentHSVs[0][6][0] = 0.35
    segmentHSVs[0][6][1] = 1
    segmentHSVs[0][6][2] = 1
}

// Pixelblaze 3 - Rail UV and Rail RGB
// Segment 7 - Base
export function preRender2_7() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment2_7() {
    segmentHSVs[0][7][0] = 0.85
    segmentHSVs[0][7][1] = 1
    segmentHSVs[0][7][2] = 1
}

// Pixelblaze 3 - Misc
// Segment 0 - Front Center
export function preRender3_0() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment3_0() {
    segmentHSVs[1][0][0] = 0.2
    segmentHSVs[1][0][1] = 1
    segmentHSVs[1][0][2] = 1
}

// Pixelblaze 3 - Misc
// Segment 1 - Left Shield
export function preRender3_1() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment3_1() {
    segmentHSVs[0][1][0] = 0.5
    segmentHSVs[0][1][1] = 1
    segmentHSVs[0][1][2] = 1
}

// Pixelblaze 3 - Misc
// Segment 2 - Right Shield
export function preRender3_2() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment3_2() {
    segmentHSVs[0][2][0] = 0.25
    segmentHSVs[0][2][1] = 1
    segmentHSVs[0][2][2] = 1
}

// Pixelblaze 3 - Misc
// Segment 3 - Left Accent
export function preRender3_3() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment3_3() {
    segmentHSVs[0][3][0] = 0.75
    segmentHSVs[0][3][1] = 1
    segmentHSVs[0][3][2] = 1
}

// Pixelblaze 3 - Misc
// Segment 4 - Right Accent
export function preRender3_4() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment3_4() {
    segmentHSVs[0][4][0] = 0.1
    segmentHSVs[0][4][1] = 1
    segmentHSVs[0][4][2] = 1
}

// Pixelblaze 3 - Misc
// Segment 5 - Left Detail
export function preRender3_5() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment3_5() {
    segmentHSVs[0][5][0] = 0.6
    segmentHSVs[0][5][1] = 1
    segmentHSVs[0][5][2] = 1
}

// Pixelblaze 3 - Misc
// Segment 6 - Right Detail
export function preRender3_6() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment3_6() {
    segmentHSVs[0][6][0] = 0.35
    segmentHSVs[0][6][1] = 1
    segmentHSVs[0][6][2] = 1
}

// Pixelblaze 3 - Misc
// Segment 7 - Base
export function preRender3_7() {
    // Blank preRender function for Pixelblaze 0, Segment 0
  }
  
export function segment3_7() {
    segmentHSVs[0][7][0] = 0.85
    segmentHSVs[0][7][1] = 1
    segmentHSVs[0][7][2] = 1
}


preRenders[0][0] = preRender0_0
preRenders[0][1] = preRender0_1
preRenders[0][2] = preRender0_2
preRenders[0][3] = preRender0_3
preRenders[0][4] = preRender0_4
preRenders[0][5] = preRender0_5
preRenders[0][6] = preRender0_6
preRenders[0][7] = preRender0_7
preRenders[1][0] = preRender1_0
preRenders[1][1] = preRender1_1
preRenders[1][2] = preRender1_2
preRenders[1][3] = preRender1_3
preRenders[1][4] = preRender1_4
preRenders[1][5] = preRender1_5
preRenders[1][6] = preRender1_6
preRenders[1][7] = preRender1_7
preRenders[2][0] = preRender2_0
preRenders[2][1] = preRender2_1
preRenders[2][2] = preRender2_2
preRenders[2][3] = preRender2_3
preRenders[2][4] = preRender2_4
preRenders[2][5] = preRender2_5
preRenders[2][6] = preRender2_6
preRenders[2][7] = preRender2_7
preRenders[3][0] = preRender3_0
preRenders[3][1] = preRender3_1
preRenders[3][2] = preRender3_2
preRenders[3][3] = preRender3_3
preRenders[3][4] = preRender3_4
preRenders[3][5] = preRender3_5
preRenders[3][6] = preRender3_6
preRenders[3][7] = preRender3_7


  
// Add more segment functions for other Pixelblaze devices...
segmentPatterns[0][0] = segment0_0
segmentPatterns[0][1] = segment0_1
segmentPatterns[0][2] = segment0_2
segmentPatterns[0][3] = segment0_3
segmentPatterns[0][4] = segment0_4
segmentPatterns[0][5] = segment0_5
segmentPatterns[0][6] = segment0_6
segmentPatterns[0][7] = segment0_7
segmentPatterns[1][0] = segment1_0
segmentPatterns[1][1] = segment1_1
segmentPatterns[1][2] = segment1_2
segmentPatterns[1][3] = segment1_3
segmentPatterns[1][4] = segment1_4
segmentPatterns[1][5] = segment1_5
segmentPatterns[1][6] = segment1_6
segmentPatterns[1][7] = segment1_7
segmentPatterns[2][0] = segment2_0
segmentPatterns[2][1] = segment2_1
segmentPatterns[2][2] = segment2_2
segmentPatterns[2][3] = segment2_3
segmentPatterns[2][4] = segment2_4
segmentPatterns[2][5] = segment2_5
segmentPatterns[2][6] = segment2_6
segmentPatterns[2][7] = segment2_7
segmentPatterns[3][0] = segment3_0
segmentPatterns[3][1] = segment3_1
segmentPatterns[3][2] = segment3_2
segmentPatterns[3][3] = segment3_3
segmentPatterns[3][4] = segment3_4
segmentPatterns[3][5] = segment3_5
segmentPatterns[3][6] = segment3_6
segmentPatterns[3][7] = segment3_7

// Set patterns for other Pixelblaze devices...

export function blendSegments(pattern1, pattern2) {
  FADE_PERCENT = FADE_PERCENT + 0.00005
  ONE_MINUS_FADE_PERCENT = 1 - FADE_PERCENT
  h = segmentHSVs[PIXELBLAZE_NUMBER][pattern1][0] * ONE_MINUS_FADE_PERCENT + segmentHSVs[PIXELBLAZE_NUMBER][pattern2][0] * FADE_PERCENT
  s = segmentHSVs[PIXELBLAZE_NUMBER][pattern1][1] * ONE_MINUS_FADE_PERCENT + segmentHSVs[PIXELBLAZE_NUMBER][pattern2][1] * FADE_PERCENT
  v = (segmentHSVs[PIXELBLAZE_NUMBER][pattern1][2] * ONE_MINUS_FADE_PERCENT + segmentHSVs[PIXELBLAZE_NUMBER][pattern2][2] * FADE_PERCENT) * abs(0.5 - FADE_PERCENT)
  
  blendHsv[0] = h
  blendHsv[1] = s
  blendHsv[2] = v
}

export function fadeBlackBetweenSegments(pattern1, pattern2) {
  FADE_PERCENT = FADE_PERCENT + 0.00005
  ONE_MINUS_FADE_PERCENT = 1 - FADE_PERCENT
  v = (segmentHSVs[PIXELBLAZE_NUMBER][pattern1][2] * ONE_MINUS_FADE_PERCENT + segmentHSVs[PIXELBLAZE_NUMBER][pattern2][2] * FADE_PERCENT) * abs(0.5 - FADE_PERCENT)
  if (FADE_PERCENT < 0.5) {
    h = segmentHSVs[PIXELBLAZE_NUMBER][pattern1][0]
    s = segmentHSVs[PIXELBLAZE_NUMBER][pattern1][1]
  } else {
    h = segmentHSVs[PIXELBLAZE_NUMBER][pattern2][0]
    s = segmentHSVs[PIXELBLAZE_NUMBER][pattern2][1]
  }
  
  blendHsv[0] = h
  blendHsv[1] = s
  blendHsv[2] = v
}

export function changeSegments() {
  if (CURRENT_SEGMENT == 1) {
    CURRENT_SEGMENT = 0
    PREVIOUS_SEGMENT = 1
  } else {
    CURRENT_SEGMENT = 1
    PREVIOUS_SEGMENT = 0
  }
}

export function beforeRender(delta) {
  SEGMENT_TRIGGER_TIMER = time(0.14)
  if (SEGMENT_TRIGGER_TIMER < 0.01 && FADE_IN_PROGRESS == 0) {
    TRIGGER_SEGMENT_CHANGE = 1
  }
  if (TRIGGER_SEGMENT_CHANGE == 1) {
    changeSegments()
    TRIGGER_SEGMENT_CHANGE = 0
    FADE_PERCENT = 0
    FADE_IN_PROGRESS = 1
  }
  if (FADE_PERCENT >= 1) {
    FADE_IN_PROGRESS = 0
  }
  preRenders[PIXELBLAZE_NUMBER][CURRENT_SEGMENT]()
}

export function render(index) {
  if (FADE_IN_PROGRESS == 1) {
    segmentPatterns[PIXELBLAZE_NUMBER][PREVIOUS_SEGMENT]()
    segmentPatterns[PIXELBLAZE_NUMBER][CURRENT_SEGMENT]()
    fadeBlackBetweenSegments(PREVIOUS_SEGMENT, CURRENT_SEGMENT)
    hsv(blendHsv[0], blendHsv[1], blendHsv[2])
  } else {
    segmentPatterns[PIXELBLAZE_NUMBER][CURRENT_SEGMENT]()
    hsv(segmentHSVs[PIXELBLAZE_NUMBER][CURRENT_SEGMENT][0], segmentHSVs[PIXELBLAZE_NUMBER][CURRENT_SEGMENT][1], segmentHSVs[PIXELBLAZE_NUMBER][CURRENT_SEGMENT][2])
  }
}