 /* eslint-disable */

 export var PIXELBLAZE_NUMBER = 2
 export var TRIGGER_SEGMENT_CHANGE
 export var NEW_SEGMENT
 export var CURRENT_SEGMENT=0
 export var PREVIOUS_SEGMENT
 export var FADE_IN_PROGRESS = 0
 export var FADE_PERCENT
 export var TRIGGER_LIGHTNING=0
 export var LIGHTNING_IN_PROGRESS=0
 export var LIGHTNING_PERCENT
 
 var SEGMENT_TRIGGER_TIMER
 var ONE_MINUS_FADE_PERCENT
 
 var PIXELS_PER_SHIELD = 25
 var PIXELS_PER_WWA_HULL = 74
 var PIXELS_PER_ALL_WWA_HULL = 4 * PIXELS_PER_ALL_WWA_HULL
 var PIXELS_PER_WWA_SIDE = 74
 var PIXELS_PER_ALL_WWA_SIDE = 4 * PIXELS_PER_WWA_SIDE
 var PIXELS_PER_RGB_SIDE = 147
 var PIXELS_PER_ALL_RGB_SIDES = PIXELS_PER_RGB_SIDE * 4
 var PIXELS_PER_SPIRAL = 98
 var PIXELS_PER_LANTERN = 60
 var PIXELS_PER_SPIRAL_AND_LANTERN = PIXELS_PER_SPIRAL + PIXELS_PER_LANTERN
 var PIXELS_BEFORE_MAST = PIXELS_PER_ALL_RGB_SIDES + (2 * PIXELS_PER_SPIRAL_AND_LANTERN)
 var PIXELS_PER_MAST = 109
 var PIXELS_BEFORE_SUNSTONE = PIXELS_BEFORE_MAST + PIXELS_PER_MAST
 var PIXELS_PER_SUNSTONE= 5
 
 //ocean lights
 pinMode(25,OUTPUT)
 pinMode(26,OUTPUT)
 digitalWrite(25,HIGH)
 digitalWrite(26,HIGH)
 
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
 var flamesHeat = array(PIXELS_PER_SHIELD + 1);
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
 
 export function render2D(index,x_0_0,y_0_0, segment) {
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
     segmentHSVs[PIXELBLAZE_NUMBER][segment][0] = wavesColors[h_0_0]
     segmentHSVs[PIXELBLAZE_NUMBER][segment][1] = 0.9
     segmentHSVs[PIXELBLAZE_NUMBER][segment][2] = pow(v_0_0,1.25)
   }
   
   
 // Pixelblaze 0 - Rails and uplighting
 // Segment 0 - port waves
 export function preRender0_0(delta) {
     timebase = (timebase + delta / 1000) % 3600
     t_0_0 = t_0_0 + 0.0000
   
     tx = -timebase / 4    // speed of x axis movement
     ty = timebase / 2    // speed of y axis movement
   }
 
 export function segment0_0(index) {
     if (index < PIXELS_PER_ALL_WWA_SIDE) {
         // We're in the WWA strips territory
         var stripIndex = floor(index / PIXELS_PER_WWA_SIDE);
         var localIndex = index % PIXELS_PER_WWA_SIDE;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_SIDE - localIndex;
         }
 
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_SIDE + localIndex) ;
 
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 0);
     } else {
         // We're in the WWA strips territory
         var stripIndex = floor((index - PIXELS_PER_ALL_WWA_SIDE) / PIXELS_PER_WWA_HULL);
         var localIndex = index % PIXELS_PER_WWA_HULL;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_HULL - localIndex;
         }
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_HULL + localIndex);
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 0);
     }
 }
 
 
 
 // Pixelblaze 0 - Rails and uplighting
 // Segment 1 - moving slowly ish
 export function preRender0_1(delta) {
     timebase = (timebase + delta / 1000) % 3600
     t_0_0 = t_0_0 + 0.0005
   
     tx = -timebase / 4    // speed of x axis movement
     ty = timebase / 2    // speed of y axis movement
   }
   
 export function segment0_1(index) {
     if (index < PIXELS_PER_ALL_WWA_SIDE) {
         // We're in the WWA strips territory
         var stripIndex = floor(index / PIXELS_PER_WWA_SIDE);
         var localIndex = index % PIXELS_PER_WWA_SIDE;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_SIDE - localIndex;
         }
 
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_SIDE + localIndex) ;
 
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 1);
     } else {
         // We're in the WWA strips territory
         var stripIndex = floor((index - PIXELS_PER_ALL_WWA_SIDE) / PIXELS_PER_WWA_HULL);
         var localIndex = index % PIXELS_PER_WWA_HULL;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_HULL - localIndex;
         }
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_HULL + localIndex);
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 1);
     }
 }
 
 // Pixelblaze 0 - Rails and uplighting
 // Segment 2 - medium velocity
 export function preRender0_2(delta) {
     timebase = (timebase + delta / 1000) % 3600
     t_0_0 = t_0_0 + 0.0008
   
     tx = -timebase / 4    // speed of x axis movement
     ty = timebase / 2    // speed of y axis movement
   }
   
 export function segment0_2(index) {
     if (index < PIXELS_PER_ALL_WWA_SIDE) {
         // We're in the WWA strips territory
         var stripIndex = floor(index / PIXELS_PER_WWA_SIDE);
         var localIndex = index % PIXELS_PER_WWA_SIDE;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_SIDE - localIndex;
         }
 
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_SIDE + localIndex) ;
 
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 2);
     } else {
         // We're in the WWA strips territory
         var stripIndex = floor((index - PIXELS_PER_ALL_WWA_SIDE) / PIXELS_PER_WWA_HULL);
         var localIndex = index % PIXELS_PER_WWA_HULL;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_HULL - localIndex;
         }
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_HULL + localIndex);
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 2);
     }
 }
 
 // Pixelblaze 0 - Rails and uplighting
 // Segment 3 - high velocity
 export function preRender0_3(delta) {
     timebase = (timebase + delta / 1000) % 3600
     t_0_0 = t_0_0 + 0.0012
   
     tx = -timebase / 4    // speed of x axis movement
     ty = timebase / 2    // speed of y axis movement
   }
   
 export function segment0_3(index) {
     if (index < PIXELS_PER_ALL_WWA_SIDE) {
         // We're in the WWA strips territory
         var stripIndex = floor(index / PIXELS_PER_WWA_SIDE);
         var localIndex = index % PIXELS_PER_WWA_SIDE;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_SIDE - localIndex;
         }
 
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_SIDE + localIndex) ;
 
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 3);
     } else {
         // We're in the WWA strips territory
         var stripIndex = floor((index - PIXELS_PER_ALL_WWA_SIDE) / PIXELS_PER_WWA_HULL);
         var localIndex = index % PIXELS_PER_WWA_HULL;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_HULL - localIndex;
         }
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_HULL + localIndex);
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 3);
     }
 }
 
 // Pixelblaze 0 - Rails and uplighting
 // Segment 4 - no velocity, no rail lights
 export function preRender0_4(delta) {
     timebase = (timebase + delta / 1000) % 3600
     t_0_0 = t_0_0 + 0
   
     tx = -timebase / 4    // speed of x axis movement
     ty = timebase / 2    // speed of y axis movement
   }
   
 export function segment0_4(index) {
   if (index < PIXELS_PER_ALL_WWA_HULL) {
     hsv(0,0,0)
   } else {
     if (index < PIXELS_PER_ALL_WWA_SIDE) {
         // We're in the WWA strips territory
         var stripIndex = floor(index / PIXELS_PER_WWA_SIDE);
         var localIndex = index % PIXELS_PER_WWA_SIDE;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_SIDE - localIndex;
         }
 
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_SIDE + localIndex) ;
 
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 4);
     } else {
         // We're in the WWA strips territory
         var stripIndex = floor((index - PIXELS_PER_ALL_WWA_SIDE) / PIXELS_PER_WWA_HULL);
         var localIndex = index % PIXELS_PER_WWA_HULL;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_HULL - localIndex;
         }
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_HULL + localIndex);
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 4);
     }
   }
   }
 
 // Pixelblaze 0 - Rails and uplighting
 // Segment 5 - high velocity, no rail lights
 export function preRender0_5(delta) {
     timebase = (timebase + delta / 1000) % 3600
     t_0_0 = t_0_0 + 0.0012
   
     tx = -timebase / 4    // speed of x axis movement
     ty = timebase / 2    // speed of y axis movement
   }
   
 export function segment0_5(index) {
   if (index < PIXELS_PER_ALL_WWA_HULL) {
     hsv(0,0,0)
   } else {
     if (index < PIXELS_PER_ALL_WWA_SIDE) {
         // We're in the WWA strips territory
         var stripIndex = floor(index / PIXELS_PER_WWA_SIDE);
         var localIndex = index % PIXELS_PER_WWA_SIDE;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_SIDE - localIndex;
         }
 
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_SIDE + localIndex) ;
 
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 5);
     } else {
         // We're in the WWA strips territory
         var stripIndex = floor((index - PIXELS_PER_ALL_WWA_SIDE) / PIXELS_PER_WWA_HULL);
         var localIndex = index % PIXELS_PER_WWA_HULL;
         
         // Reverse every other strip
         if (stripIndex % 2 === 1) {
             localIndex = PIXELS_PER_WWA_HULL - localIndex;
         }
         // Calculate the overall progress along all WWA strips
         var directionCorrectedIndex = (stripIndex * PIXELS_PER_WWA_HULL + localIndex);
         render2D(directionCorrectedIndex,directionCorrectedIndex/pixelCount,0.25, 5);
     }
   }
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
     for (i = PIXELS_PER_SHIELD; i >= 1; i--) {
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
 function segmentFlamePattern(index, hue, segment) {
     // Newfire - Doomfire in 1D!
     // MIT License
     // 12/19/23 ZRanger1
 
     // Configuration
     var saturation = 1.75;  // Default 1.75
     var brightness = 1;  // Default 1
 
     var shieldOffset = floor(index / PIXELS_PER_SHIELD) * PIXELS_PER_SHIELD;
     var midpointOffset = floor(PIXELS_PER_SHIELD / 2);
     // Use this middle index to mirror it vertically, so the flames look like they're going up
     // equally on each side
     var flamesMidpoint = shieldOffset + midpointOffset;
     var mirroredIndex = 2 * (index < flamesMidpoint) ? abs(flamesMidpoint - index) : index - flamesMidpoint;
     // map temperature to display pixel, gamma correct and display  
     var k = flamesHeat[mirroredIndex % PIXELS_PER_SHIELD];
     k = k * k * k;
     segmentHSVs[PIXELBLAZE_NUMBER][segment][0] = hue + (0.1 * k)
     segmentHSVs[PIXELBLAZE_NUMBER][segment][1] = saturation - k
     segmentHSVs[PIXELBLAZE_NUMBER][segment][2] = brightness * k
 }
 
 export function segment1_0(index) {
     // Red
     segmentFlamePattern(index, 0.0,0);
 }
 
 
 // Pixelblaze 1 - Shields
 // Segment 1 - Left Shield
 export function preRender1_1(delta) {
     preRenderFlames(delta);
 }
   
 export function segment1_1(index) {
     // Blue
     segmentFlamePattern(index, 0.67,1);
 }
 
 var t_1_2 = 0
 var shieldsBrightness = 0
 // Pixelblaze 1 - Shields
 // Segment 2 - Right Shield
 export function preRender1_2(delta) {
     t_1_2 = (t_1_2 + 0.0005) % 1
     shieldsBrightness = 1 - abs(0.5 - (t_1_2))
     shieldsBrightness = shieldsBrightness * shieldsBrightness * shieldsBrightness
   }
   
 export function segment1_2(index) {
     segmentHSVs[0][2][0] = 0.6
     segmentHSVs[0][2][1] = 1
     segmentHSVs[0][2][2] = shieldsBrightness
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
 
 
 // We're repeating the flame pattern every 25 LEDs. Otherwise this would be pixelCount+1
 var flamesHeatLantern = array(PIXELS_PER_LANTERN + 1);
 // flamesHeat[0] is our heat source. It drives the whole simulation. 1 is the hottest value,
 // corresponding to white.
 flamesHeatLantern[0] = 0.9;  // Default 0.9
 var flamesFrameTimer = 0;
 
 function preRenderFlamesLantern(delta) {
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
     for (i = PIXELS_PER_LANTERN; i >= 1; i--) {
         r = random(cooling);
         k = max(0, i - (1 + random(1)));
         flamesHeatLantern[i] = max(0, flamesHeatLantern[k] - r);
     }
 
     // Borrowed and extended the spark concept from the
     // Sparkfire library pattern
     // This one can make dark spots as well as sparks, for
     // a more interesting look.
     if (random(1) <= variability) {
         i = ceil(random(PIXELS_PER_LANTERN / 8));
         flamesHeatLantern[i] = min(flamesHeatLantern[i] + (random(2) - 0.5), max(0.575, flamesHeatLantern[0]));
     }
 }
 
 
 /**
  * Shield flame pattern
  * @param hue base hue, 0 = red, .33 = green ,.67 = blue
  */
 function segmentFlamePatternLantern(index, hue, segment) {
     // Newfire - Doomfire in 1D!
     // MIT License
     // 12/19/23 ZRanger1
 
     // Configuration
     var saturation = 1.75;  // Default 1.75
     var brightness = 1;  // Default 1
 
     var shieldOffset = floor(index / PIXELS_PER_LANTERN) * PIXELS_PER_LANTERN;
     var midpointOffset = floor(PIXELS_PER_LANTERN / 2);
     // Use this middle index to mirror it vertically, so the flames look like they're going up
     // equally on each side
     var flamesMidpoint = midpointOffset;
     var localFlameIndex = PIXELS_PER_LANTERN+12 - ((index - PIXELS_PER_ALL_RGB_SIDES) % (PIXELS_PER_SPIRAL_AND_LANTERN) - (2 * PIXELS_PER_SPIRAL_AND_LANTERN))
     //var mirroredIndex = 2 * (localFlameIndex < flamesMidpoint) ? abs(flamesMidpoint - index) : index - flamesMidpoint;
     // map temperature to display pixel, gamma correct and display  
     var k = flamesHeatLantern[localFlameIndex % PIXELS_PER_LANTERN];
     k = k * k * k;
     segmentHSVs[PIXELBLAZE_NUMBER][segment][0] = hue + (0.1 * k)
     segmentHSVs[PIXELBLAZE_NUMBER][segment][1] = saturation - k
     segmentHSVs[PIXELBLAZE_NUMBER][segment][2] = brightness * k
 }
 
 var t_2_0 = 0
 var spiralBrightness = 0
 // Pixelblaze 2 - Rail UV and Rail RGB
 // Segment 0 - Portal
 export function preRender2_0(delta) {
     t_2_0 = (t_2_0 + 0.0005) % 1
     spiralBrightness = max(0.05, 1 - abs(0.5 - (t_2_0)))
     spiralBrightness = spiralBrightness * spiralBrightness
     preRenderFlamesLantern(delta)
 }
   
 export function segment2_0(index) {
     if (index < PIXELS_PER_ALL_RGB_SIDES) {
         segmentHSVs[PIXELBLAZE_NUMBER][0][0] = 0
         segmentHSVs[PIXELBLAZE_NUMBER][0][1] = 0
         segmentHSVs[PIXELBLAZE_NUMBER][0][2] = 0
     } else if ( index >= (PIXELS_PER_ALL_RGB_SIDES) && index < PIXELS_BEFORE_MAST) {
         local_index = (index - PIXELS_PER_ALL_RGB_SIDES) % (PIXELS_PER_SPIRAL_AND_LANTERN)
         if (local_index < PIXELS_PER_SPIRAL) {
             //spiral
             segmentHSVs[PIXELBLAZE_NUMBER][0][0] = 0.57
             segmentHSVs[PIXELBLAZE_NUMBER][0][1] = 1
             segmentHSVs[PIXELBLAZE_NUMBER][0][2] = spiralBrightness
         } else {
             //lantern
             segmentFlamePatternLantern(index, 0.0,0);
         }
     } else if (index < (PIXELS_BEFORE_SUNSTONE)) {
         //mast
         segmentHSVs[PIXELBLAZE_NUMBER][0][0] = 0.9
         segmentHSVs[PIXELBLAZE_NUMBER][0][1] = 1
         segmentHSVs[PIXELBLAZE_NUMBER][0][2] = 1
     } else {
         //sunstone
         segmentHSVs[PIXELBLAZE_NUMBER][0][0] = 0.0 + 0.02 * (index - PIXELS_BEFORE_SUNSTONE)
         segmentHSVs[PIXELBLAZE_NUMBER][0][1] = 0.9
         segmentHSVs[PIXELBLAZE_NUMBER][0][2] = 1
     }
     return false
 }
 
 
 var rbSpeedRange = 0.2 // this scales the milliseconds back to a usable range. shown here, the max rate is 1Hz
 export var rbSpeed = rbSpeedRange // controlled by slider
 var t1_2_1
 
 export function sliderSpeed(s) {
     speed = s*s * rbSpeedRange // square it to give better control at lower values, then scale it
   }
 
 // Pixelblaze 2 - Rail RGB and Misc
 // Segment 1 - Rainbow Bridge
 export function preRender2_1(delta) {
     t1_2_1 = (t1_2_1 - 0.01 * rbSpeed) % 1 // accumulate time in t1, and wrap it using modulus math to keep it between 0-1
     if (rbSpeed < 6) {
         rbSpeed = rbSpeed + 0.01
     }
     t_2_0 = (t_2_0 + 0.0005) % 1
     spiralBrightness = max(0.05, 1 - abs(0.5 - (t_2_0)))
     spiralBrightness = spiralBrightness * spiralBrightness
     preRenderFlamesLantern(delta)
 }
   
 export function segment2_1(index) {
     if (index < PIXELS_PER_ALL_RGB_SIDES) {
         if ((index / PIXELS_PER_RGB_SIDE) < 2) {
             h = t1_2_1 - (index % PIXELS_PER_RGB_SIDE)/PIXELS_PER_RGB_SIDE
         } else {
             h = t1_2_1 + (index % PIXELS_PER_RGB_SIDE)/PIXELS_PER_RGB_SIDE
         }
         segmentHSVs[PIXELBLAZE_NUMBER][1][0] = h
         segmentHSVs[PIXELBLAZE_NUMBER][1][1] = 1
         segmentHSVs[PIXELBLAZE_NUMBER][1][2] = 1
     } else if ( index >= (PIXELS_PER_ALL_RGB_SIDES) && index < PIXELS_BEFORE_MAST) {
         local_index = (index - PIXELS_PER_ALL_RGB_SIDES) % (PIXELS_PER_SPIRAL_AND_LANTERN)
         if (local_index < PIXELS_PER_SPIRAL) {
             //spiral
             segmentHSVs[PIXELBLAZE_NUMBER][1][0] = 0.57
             segmentHSVs[PIXELBLAZE_NUMBER][1][1] = 1
             segmentHSVs[PIXELBLAZE_NUMBER][1][2] = spiralBrightness
         } else {
             segmentFlamePatternLantern(index, 0.0,1);
         }
     } else if (index < (PIXELS_BEFORE_SUNSTONE)) {
         //mast
         segmentHSVs[PIXELBLAZE_NUMBER][1][0] = 0.9
         segmentHSVs[PIXELBLAZE_NUMBER][1][1] = 1
         segmentHSVs[PIXELBLAZE_NUMBER][1][2] = 1
     } else {
         //sunstone
         segmentHSVs[PIXELBLAZE_NUMBER][1][0] = 0.0 + 0.02 * (index - PIXELS_BEFORE_SUNSTONE)
         segmentHSVs[PIXELBLAZE_NUMBER][1][1] = 0.9
         segmentHSVs[PIXELBLAZE_NUMBER][1][2] = 1
     }
     return false
 }
 
 // Pixelblaze 2 - Rail RGB and Misc
 // Segment 2 - Right Shield
 export function preRender2_2(delta) {
     t1_2_1 = (t1_2_1 + 0.02) % 1 // accumulate time in t1, and wrap it using modulus math to keep it between 0-1
     t_2_0 = (t_2_0 + 0.005) % 1
     spiralBrightness = max(0.05, 1 - abs(0.5 - (t_2_0)))
     spiralBrightness = spiralBrightness * spiralBrightness
     preRenderFlamesLantern(delta)
   }
   
 export function segment2_2(index) {
     if (index < PIXELS_PER_ALL_RGB_SIDES) {
         if ((index / PIXELS_PER_RGB_SIDE) % 2 == 0) {
             h = t1_2_1
         } else {
             h = t1_2_1
         }
         segmentHSVs[PIXELBLAZE_NUMBER][2][0] = h
         segmentHSVs[PIXELBLAZE_NUMBER][2][1] = 1
         segmentHSVs[PIXELBLAZE_NUMBER][2][2] = 1
     } else if ( index >= (PIXELS_PER_ALL_RGB_SIDES) && index < PIXELS_BEFORE_MAST) {
         local_index = (index - PIXELS_PER_ALL_RGB_SIDES) % (PIXELS_PER_SPIRAL_AND_LANTERN)
         if (local_index < PIXELS_PER_SPIRAL) {
             //spiral
             segmentHSVs[PIXELBLAZE_NUMBER][2][0] = 0.57
             segmentHSVs[PIXELBLAZE_NUMBER][2][1] = 1
             segmentHSVs[PIXELBLAZE_NUMBER][2][2] = spiralBrightness
         } else {
             segmentFlamePatternLantern(index, 0.0,2);
         }
     } else if (index < (PIXELS_BEFORE_SUNSTONE)) {
         //mast
         segmentHSVs[PIXELBLAZE_NUMBER][2][0] = 0.9
         segmentHSVs[PIXELBLAZE_NUMBER][2][1] = 1
         segmentHSVs[PIXELBLAZE_NUMBER][2][2] = 1
     } else {
         //sunstone
         segmentHSVs[PIXELBLAZE_NUMBER][2][0] = 0.0 + 0.02 * (index - PIXELS_BEFORE_SUNSTONE)
         segmentHSVs[PIXELBLAZE_NUMBER][2][1] = 0.9
         segmentHSVs[PIXELBLAZE_NUMBER][2][2] = 1
     
     }
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
   //v = (segmentHSVs[PIXELBLAZE_NUMBER][pattern1][2] * ONE_MINUS_FADE_PERCENT + segmentHSVs[PIXELBLAZE_NUMBER][pattern2][2] * FADE_PERCENT)
   if (FADE_PERCENT < 0.5) {
     h = segmentHSVs[PIXELBLAZE_NUMBER][pattern1][0]
     s = segmentHSVs[PIXELBLAZE_NUMBER][pattern1][1]
     v = segmentHSVs[PIXELBLAZE_NUMBER][pattern1][2] * abs(0.5 - FADE_PERCENT)
   } else {
     h = segmentHSVs[PIXELBLAZE_NUMBER][pattern2][0]
     s = segmentHSVs[PIXELBLAZE_NUMBER][pattern2][1]
     v = segmentHSVs[PIXELBLAZE_NUMBER][pattern2][2] * abs(0.5 - FADE_PERCENT)
   }
   
   blendHsv[0] = h
   blendHsv[1] = s
   blendHsv[2] = v
 }
 
 export function changeSegments() {
     resetVariables()
     PREVIOUS_SEGMENT = CURRENT_SEGMENT
     CURRENT_SEGMENT = NEW_SEGMENT
     FADE_PERCENT = 0
     FADE_IN_PROGRESS = 1
     TRIGGER_SEGMENT_CHANGE = 0
 }
 
 export function resetVariables() {
   rbSpeed = rbSpeedRange // controlled by slider
 }
 
 export function beforeRender(delta) {
 
   // uncomment this block to randomly switch pattenrs to test
 //   SEGMENT_TRIGGER_TIMER = time(0.14)
 //   if (SEGMENT_TRIGGER_TIMER < 0.01 && FADE_IN_PROGRESS == 0) {
 //     TRIGGER_SEGMENT_CHANGE = 1
 //     NEW_SEGMENT = 0//random(3)
 //   }
   if (TRIGGER_SEGMENT_CHANGE == 1) {
     changeSegments()
   }
   if (FADE_PERCENT >= 1) {
     FADE_IN_PROGRESS = 0
   }
   if (FADE_IN_PROGRESS) {
     preRenders[PIXELBLAZE_NUMBER][PREVIOUS_SEGMENT](delta)
   }
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
   preRenders[PIXELBLAZE_NUMBER][CURRENT_SEGMENT](delta)
 }
 
 export function render(index) {
 digitalWrite(25,1)
 digitalWrite(26,1)
   if (FADE_IN_PROGRESS == 1) {
     segmentPatterns[PIXELBLAZE_NUMBER][PREVIOUS_SEGMENT](index)
     segmentPatterns[PIXELBLAZE_NUMBER][CURRENT_SEGMENT](index)
     fadeBlackBetweenSegments(PREVIOUS_SEGMENT, CURRENT_SEGMENT)
     hsv(blendHsv[0], blendHsv[1], blendHsv[2])
   } else {
     segmentPatterns[PIXELBLAZE_NUMBER][CURRENT_SEGMENT](index)
     hsv(segmentHSVs[PIXELBLAZE_NUMBER][CURRENT_SEGMENT][0], segmentHSVs[PIXELBLAZE_NUMBER][CURRENT_SEGMENT][1], segmentHSVs[PIXELBLAZE_NUMBER][CURRENT_SEGMENT][2])
   }   
   if (LIGHTNING_IN_PROGRESS) {
     hsv(1,0,1)
   }
 }
 