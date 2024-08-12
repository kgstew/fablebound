/* eslint-disable */

export var PIXELBLAZE_NUMBER = 0
export var TRIGGER_SEGMENT_CHANGE
export var CURRENT_SEGMENT
export var PREVIOUS_SEGMENT
export var FADE_IN_PROGRESS = 0
export var FADE_PERCENT

var SEGMENT_TRIGGER_TIMER
var ONE_MINUS_FADE_PERCENT

export var SHOULD_RENDER_HSV

var PIXELS_PER_SHIELD = 25
var PIXELS_PER_WWA_HULL = 74
var PIXELS_PER_WWA_SIDE = 74
var PIXELS_PER_RGB_SIDE = 147

export var hsv1 = array(3)
export var hsv2 = array(3)
export var blendHsv = array(3)

numPixelblazes = 4
numSegmentsPerPixelblaze = 8
segmentHSVs = array(numPixelblazes)
segmentPatterns = array(numPixelblazes)
// preRender runs once at the beginning of each animation
preRenders = array(numPixelblazes)

for (i = 0; i < numPixelblazes; i++) {
  segmentHSVs[i] = array(numSegmentsPerPixelblaze)
  segmentPatterns[i] = array(numSegmentsPerPixelblaze)
  preRenders[i] = array(numSegmentsPerPixelblaze)
  for (j = 0; j < numSegmentsPerPixelblaze; j++) {
    segmentHSVs[i][j] = array(3)
  }
}




// number of displayed columns. Could easily have a UI control
var nColumns = 10

var wavesColors = [
  0.6, 0.7, 0.8, 0.88, 0.91,   
  0.66, 0.74, 0.93, 0.83, 0.77
]

// We're repeating the flame pattern every 25 LEDs. Otherwise this would be pixelCount+1
var ledsPerShield = 25;
var flamesHeat = array(ledsPerShield + 1);
// flamesHeat[0] is our heat source. It drives the whole simulation. 1 is the hottest value,
// corresponding to white.
flamesHeat[0] = 0.9;  // Default 0.9
var flamesFrameTimer = 0;

timebase = 0;
var tx
var ty
var x_0_0
var y_0_0
var h_0_0
var t_0_0 = 0

export function render2D(index,x_0_0,y_0_0) {
    // distort y coord with perlin noise to vary width of individual columns
    // (constant multipliers are hand-tuned)
    y_0_0 -= 0.3 * perlin(x_0_0 * 2, y_0_0 * 2, ty, 1.618) 
  
    // distort x coord to create wave patterns
    x_0_0 += 0.1752 * sin(4 * (tx + y_0_0)) + t_0_0
  
    // quantize color into the specified number of column bins
    h_0_0 = floor(x_0_0 * nColumns)
  
    // the original shader colors column edges black. Here, we darken
    // and antialias them, which looks better at low resolution
    v_0_0 = (x_0_0 * nColumns - 0.5)
    v_0_0 =  1-(2*abs(v_0_0 - h_0_0));
  
    // calculate the final column color, adjust brightness
    // gradient bit and display the pixel
    h_0_0 = mod(h_0_0, nColumns) //constrain h to values between 0 and nColumns-1 by wrapping
    hsv(wavesColors[h_0_0],0.9,pow(v_0_0,1.25))
  }
  
  
// Pixelblaze 0 - Rails and uplighting
// Segment 0 - Portal
export function preRender0_0(delta) {
    timebase = (timebase + delta / 1000) % 3600
    t_0_0 = t_0_0 + 0.0000
  
    tx = -timebase / 4    // speed of x axis movement
    ty = timebase / 2    // speed of y axis movement
  }

export function segment0_0(index) {
    render2D(index,index/pixelCount,0.25);
    return false
}



// Pixelblaze 0 - Rails and uplighting
// Segment 1 - Left Shield
export function preRender0_1(delta) {
    timebase = (timebase + delta / 1000) % 3600
    t_0_0 = t_0_0 + 0.0005
  
    tx = -timebase / 4    // speed of x axis movement
    ty = timebase / 2    // speed of y axis movement
  }
  
export function segment0_1(index) {
    segment0_0(index)
    return false
}

// Pixelblaze 0 - Rails and uplighting
// Segment 2 - Right Shield
export function preRender0_2(delta) {
    timebase = (timebase + delta / 1000) % 3600
    t_0_0 = t_0_0 + 0.0008
  
    tx = -timebase / 4    // speed of x axis movement
    ty = timebase / 2    // speed of y axis movement
  }
  
export function segment0_2(index) {
    segment0_0(index)
    return false
}

// Pixelblaze 0 - Rails and uplighting
// Segment 3 - Left Accent
export function preRender0_3(delta) {
    timebase = (timebase + delta / 1000) % 3600
    t_0_0 = t_0_0 + 0.0012
  
    tx = -timebase / 4    // speed of x axis movement
    ty = timebase / 2    // speed of y axis movement
  }
  
export function segment0_3(index) {
    segment0_0(index)
    return false
}

// Pixelblaze 0 - Rails and uplighting
// Segment 4 - Right Accent
export function preRender0_4(delta) {
    // Blank preRender function for Pixelblaze 0, Segment 4
  }
  
export function segment0_4(index) {
    segmentHSVs[0][4][0] = 0.1
    segmentHSVs[0][4][1] = 1
    segmentHSVs[0][4][2] = 1
    return true
}

// Pixelblaze 0 - Rails and uplighting
// Segment 5 - Left Detail
export function preRender0_5(delta) {
    // Blank preRender function for Pixelblaze 0, Segment 5
  }
  
export function segment0_5(index) {
    segmentHSVs[0][5][0] = 0.6
    segmentHSVs[0][5][1] = 1
    segmentHSVs[0][5][2] = 1
    return true
}

// Pixelblaze 0 - Rails and uplighting
// Segment 6 - Right Detail
export function preRender0_6(delta) {
    // Blank preRender function for Pixelblaze 0, Segment 6
  }
  
export function segment0_6(index) {
    segmentHSVs[0][6][0] = 0.35
    segmentHSVs[0][6][1] = 1
    segmentHSVs[0][6][2] = 1
    return true
}

// Pixelblaze 0 - Rails and uplighting
// Segment 7 - Base
export function preRender0_7(delta) {
    // Blank preRender function for Pixelblaze 0, Segment 7
  }
  
export function segment0_7(index) {
    segmentHSVs[0][7][0] = 0.85
    segmentHSVs[0][7][1] = 1
    segmentHSVs[0][7][2] = 1
    return true
}

function preRenderFlames(delta) {
    // Newfire - Doomfire in 1D!
    // MIT License
    // 12/19/23 ZRanger1

    // Configuration
    var cooling = 0.3;  // How quickly the flame cools, default 0.3
    var variability = 0.1;  // How much flickering there is, default 0.1
    var msPerFrame = 40;

    timebase = (timebase + delta / 1000) % 3600;
    // control the simulation rate so the fire moves at
    // a more-or-less realistic speed. This is independent
    // of the actual LED frame rate, which will likely be
    // much higher.
    flamesFrameTimer += delta;
    if (flamesFrameTimer < msPerFrame) {
        return;
    }
    flamesFrameTimer = 0;

    var i;
    var r;
    var k;
    // move heat up the flame column. Instead of 2D DoomFire's
    // regular convolution kernel + wind, we sample hotter pixels
    // below us at slightly randomized distances.  This
    // gives us a less predictable fire than simply looking
    // at the pixel below the current one.
    for (i = ledsPerShield; i >= 1; i--) {
        r = random(cooling);
        k = max(0, i - (1 + random(1)));
        flamesHeat[i] = max(0, flamesHeat[k] - r);
    }

    // Borrowed and extended the spark concept from the
    // Sparkfire library pattern
    // This one can make dark spots as well as sparks, for
    // a more interesting look.
    if (random(1) <= variability) {
        i = ceil(random(pixelCount / 8));
        flamesHeat[i] = min(flamesHeat[i] + (random(2) - 0.5), max(0.575, flamesHeat[0]));
    }
}

// Pixelblaze 1 - Shields
// Segment 0 - Front Center
export function preRender1_0(delta) {
    preRenderFlames(delta);
}
  
/**
 * Shield flame pattern
 * @param hue base hue, 0 = red, .33 = green ,.67 = blue
 */
function segmentFlamePattern(index, hue) {
    // Newfire - Doomfire in 1D!
    // MIT License
    // 12/19/23 ZRanger1

    // Configuration
    var saturation = 1.75;  // Default 1.75
    var brightness = 1;  // Default 1

    var shieldOffset = floor(index / ledsPerShield) * ledsPerShield;
    var midpointOffset = floor(ledsPerShield / 2);
    // Use this middle index to mirror it vertically, so the flames look like they're going up
    // equally on each side
    var flamesMidpoint = shieldOffset + midpointOffset;
    var mirroredIndex = 2 * (index < flamesMidpoint) ? abs(flamesMidpoint - index) : index - flamesMidpoint;
    // map temperature to display pixel, gamma correct and display  
    var k = flamesHeat[mirroredIndex % ledsPerShield];
    k = k * k * k;
    hsv(hue + (0.1 * k), saturation - k, brightness * k);

    return false;
}

export function segment1_0(index) {
    // Red
    return segmentFlamePattern(index, 0.0);
}


// Pixelblaze 1 - Shields
// Segment 1 - Left Shield
export function preRender1_1(delta) {
    preRenderFlames(delta);
}
  
export function segment1_1(index) {
    // Blue
    return segmentFlamePattern(index, 0.67);
}

// Pixelblaze 1 - Shields
// Segment 2 - Right Shield
export function preRender1_2(delta) {
    // Blank preRender function for Pixelblaze 1, Segment 2
  }
  
export function segment1_2(index) {
    segmentHSVs[0][2][0] = 0.25
    segmentHSVs[0][2][1] = 1
    segmentHSVs[0][2][2] = 1
    return true
}

// Pixelblaze 1 - Shields
// Segment 3 - Left Accent
export function preRender1_3(delta) {
    // Blank preRender function for Pixelblaze 1, Segment 3
  }
  
export function segment1_3(index) {
    segmentHSVs[0][3][0] = 0.75
    segmentHSVs[0][3][1] = 1
    segmentHSVs[0][3][2] = 1
    return true
}

// Pixelblaze 1 - Shields
// Segment 4 - Right Accent
export function preRender1_4(delta) {
    // Blank preRender function for Pixelblaze 1, Segment 4
  }
  
export function segment1_4(index) {
    segmentHSVs[0][4][0] = 0.1
    segmentHSVs[0][4][1] = 1
    segmentHSVs[0][4][2] = 1
    return true
}

// Pixelblaze 1 - Shields
// Segment 5 - Left Detail
export function preRender1_5(delta) {
    // Blank preRender function for Pixelblaze 1, Segment 5
  }
  
export function segment1_5(index) {
    segmentHSVs[0][5][0] = 0.6
    segmentHSVs[0][5][1] = 1
    segmentHSVs[0][5][2] = 1
    return true
}

// Pixelblaze 1 - Shields
// Segment 6 - Right Detail
export function preRender1_6(delta) {
    // Blank preRender function for Pixelblaze 1, Segment 6
  }
  
export function segment1_6(index) {
    segmentHSVs[0][6][0] = 0.35
    segmentHSVs[0][6][1] = 1
    segmentHSVs[0][6][2] = 1
    return true
}

// Pixelblaze 1 - Shields
// Segment 7 - Base
export function preRender1_7(delta) {
    // Blank preRender function for Pixelblaze 1, Segment 7
  }
  
export function segment1_7(index) {
    segmentHSVs[0][7][0] = 0.85
    segmentHSVs[0][7][1] = 1
    segmentHSVs[0][7][2] = 1
    return true
}


// Pixelblaze 2 - Rail UV and Rail RGB
// Segment 0 - Portal
export function preRender2_0(delta) {
    // Blank preRender function for Pixelblaze 2, Segment 0
  }
  
export function segment2_0(index) {
    segmentHSVs[0][0][0] = 1
    segmentHSVs[0][0][1] = 1
    segmentHSVs[0][0][2] = 1
    return true
}

// Pixelblaze 2 - Rail RGB and Misc
// Segment 1 - Left Shield
export function preRender2_1(delta) {
    // Blank preRender function for Pixelblaze 2, Segment 1
  }
  
export function segment2_1(index) {
    segmentHSVs[0][1][0] = 0.5
    segmentHSVs[0][1][1] = 1
    segmentHSVs[0][1][2] = 1
    return true
}

// Pixelblaze 2 - Rail RGB and Misc
// Segment 2 - Right Shield
export function preRender2_2(delta) {
    // Blank preRender function for Pixelblaze 2, Segment 2
  }
  
export function segment2_2(index) {
    segmentHSVs[0][2][0] = 0.25
    segmentHSVs[0][2][1] = 1
    segmentHSVs[0][2][2] = 1
    return true
}

// Pixelblaze 2 - Rail RGB and Misc
// Segment 3 - Left Accent
export function preRender2_3(delta) {
    // Blank preRender function for Pixelblaze 2, Segment 3
  }
  
export function segment2_3(index) {
    segmentHSVs[0][3][0] = 0.75
    segmentHSVs[0][3][1] = 1
    segmentHSVs[0][3][2] = 1
    return true
}

// Pixelblaze 2 - Rail RGB and Misc
// Segment 4 - Right Accent
export function preRender2_4(delta) {
    // Blank preRender function for Pixelblaze 2, Segment 4
  }
  
export function segment2_4(index) {
    segmentHSVs[0][4][0] = 0.1
    segmentHSVs[0][4][1] = 1
    segmentHSVs[0][4][2] = 1
    return true
}

// Pixelblaze 2 - Rail RGB and Misc
// Segment 5 - Left Detail
export function preRender2_5(delta) {
    // Blank preRender function for Pixelblaze 2, Segment 5
  }
  
export function segment2_5(index) {
    segmentHSVs[0][5][0] = 0.6
    segmentHSVs[0][5][1] = 1
    segmentHSVs[0][5][2] = 1
    return true
}

// Pixelblaze 2 - Rail RGB and Misc
// Segment 6 - Right Detail
export function preRender2_6(delta) {
    // Blank preRender function for Pixelblaze 2, Segment 6
  }
  
export function segment2_6(index) {
    segmentHSVs[0][6][0] = 0.35
    segmentHSVs[0][6][1] = 1
    segmentHSVs[0][6][2] = 1
    return true
}

// Pixelblaze 2 - Rail RGB and Misc
// Segment 7 - Base
export function preRender2_7(delta) {
    // Blank preRender function for Pixelblaze 2, Segment 7
  }
  
export function segment2_7(index) {
    segmentHSVs[0][7][0] = 0.85
    segmentHSVs[0][7][1] = 1
    segmentHSVs[0][7][2] = 1
    return true
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

PIXELBLAZE_NUMBER=0
CURRENT_SEGMENT=0
FADE_IN_PROGRESS=0

export function beforeRender(delta) {
//   SEGMENT_TRIGGER_TIMER = time(0.14)
//   if (SEGMENT_TRIGGER_TIMER < 0.01 && FADE_IN_PROGRESS == 0) {
//     TRIGGER_SEGMENT_CHANGE = 1
//   }
//   if (TRIGGER_SEGMENT_CHANGE == 1) {
//     changeSegments()
//     TRIGGER_SEGMENT_CHANGE = 0
//     FADE_PERCENT = 0
//     FADE_IN_PROGRESS = 1
//   }
//   if (FADE_PERCENT >= 1) {
//     FADE_IN_PROGRESS = 0
//   }
  preRenders[PIXELBLAZE_NUMBER][CURRENT_SEGMENT](delta)
}

export function render(index) {
  // if (FADE_IN_PROGRESS == 1) {
  //   segmentPatterns[PIXELBLAZE_NUMBER][PREVIOUS_SEGMENT]()
  //   segmentPatterns[PIXELBLAZE_NUMBER][CURRENT_SEGMENT]()
  //   fadeBlackBetweenSegments(PREVIOUS_SEGMENT, CURRENT_SEGMENT)
  //   hsv(blendHsv[0], blendHsv[1], blendHsv[2])
  // } else {
    SHOULD_RENDER_HSV = segmentPatterns[PIXELBLAZE_NUMBER][CURRENT_SEGMENT](index)
    if (SHOULD_RENDER_HSV) {
        hsv(segmentHSVs[PIXELBLAZE_NUMBER][CURRENT_SEGMENT][0], segmentHSVs[PIXELBLAZE_NUMBER][CURRENT_SEGMENT][1], segmentHSVs[PIXELBLAZE_NUMBER][CURRENT_SEGMENT][2])
    // }
    }
}
