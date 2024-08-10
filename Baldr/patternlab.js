/* eslint-disable */

/*
 In this example you'll see:
 - time and animation
 - using an array to switch between modes
 - lambda style function expressions
 - Another way to make a mode switch timer
*/
var a
var b 
var c
var t
var t1
var t2 // Declare this variable here so we can reference it in our mode functions
var h
var s 
var v
var v2
var v3

numModes = 14 // Keep track of how many modes there will be
modes = array(numModes) // Make an array to store the modes

// Make a bunch of lambda style mode functions and put them in the modes array
// f is expected to be in 0..4
modes[0]  = (f, t) => (f + t) % 1 // Moving left
modes[1]  = (f, t) => (1 + f - t) % 1 // Moving right
modes[2]  = (f, t) => (f + triangle(t)) % 1 // Bounce back and forth
modes[3]  = (f, t) => (f + wave(t)) % 1 // Smooth back and forth
modes[4]  = (f, t) => square(f + t, .5) // A chaser 
modes[5]  = (f, t) => (f + triangle(triangle(t) * t)) % 1 // Combining wave functions can create interesting effects
modes[6]  = (f, t) => (f + wave(wave(t))) % 1 // Warbly movemovent
modes[7]  = (f, t) => square(triangle(wave(t)) + f, .5) // Bouncing
modes[8]  = (f, t) => wave(f + t) * wave(f + t2) // Times with different intervals create interesting waveform interactions
modes[9]  = (f, t) => wave(wave(f + t) + wave(f - t2) + f - t) // Wave textures
modes[10] = (f, t) => wave(f + wave(wave(t) + f / 4)) // Stretchy effect
modes[11] = (f, t) => wave((f - 2) * (1 + wave(t))) * wave(wave(t2) + f) // Zoomed and blended
modes[12] = (f, t) => 2 * triangle(f + wave(t)) - wave(f * .75 + wave(t2)) // Kinetic
modes[13] = (f, t) => abs(triangle(f - triangle(t2)) - wave(f * 2 + triangle(t))) // Glitch conveyer belt

mode = 0 // Start with mode 0. Remember you can prepend "export var" to use the Vars Watch.










// export function render3D(index, x, y, z) {
//   /*
//     The formula for a 3D plane is:

//       a(x − x1) + b(y − y1) + c(z − z1) = 0 

//     where the plane is normal to the vector (a, b, c). By setting out output
//     brightness to the right hand side, the initial defined plane is the dark
//     region, where `v == 0`. This pattern oscillates a, b, and c to rotate the
//     plane in space. By using the `triangle` function, which is repeatedly
//     returning 0..1 for input values continuing in either direction away from 0,
//     we get several resulting 0..1..0.. layers all normal to the vector. 

//     The `3 * wave(t1)` term introduces a periodic phase shift. The final result
//     is a series of parallel layers, rotating and slicing through 3D space.
//   */
//   v = triangle(3 * wave(t1) + a * x + b * y + c * z)

//   // Aggressively thin the plane by making medium-low v very small, for wider 
//   // dark regions
//   v = pow(v, 5)

//   // Make the highest brightness values (when v is greater than 0.8) white
//   // instead of a saturated color
//   s = v < .8
  
//   hsv(t1, s, v)
// }

// The 2D version is a slice (a projection) of the 3D version, taken at the
// // z == 0 plane
// export function render2D(index, x, y) {
//   render3D(index, x, y, 0)
// }



/* 
  The beforeRender function is called once before each animation frame
  and is passed a delta in fractional milliseconds since the last frame.
  This has very high resolution, down to 6.25 nanoseconds!
*/
export function beforeRender(delta) {
  t = time(.05)  // Loops 0..1 about every 3.3 seconds
  t2 = time(.03) // Loops 0..1 about every 1.3 seconds
  tfade = time(0.1)
  modeT = time(numModes * 0.6 / 65.536) // 600ms per mode, so 0..1 every numModes * 0.6 seconds
  mode = floor(modeT *  numModes) // mode will be 0, 1, 2, etc up to (numModes - 1)


  t1 = time(.1)
  
  a = sin(time(.10) * PI2)  // -1..1 sinusoid every 6.5 seconds
  b = sin(time(.05) * PI2)  // -1..1 sinusoid every 3.3 seconds
  c = sin(time(.07) * PI2)  // -1..1 sinusoid every 6.6 seconds

  // Uncomment this line to check out a specific mode
  mode = 1
}

/*
  The render function is called for every pixel. Here we're going to use 
  the pixel's index to make a number between 0.0 and 4.0. This acts as a 4X 
  frequency modifier, repeating the pattern 4 times across the strip length.
  That 0-4 value is passed in to the current mode function and its output is 
  used to set the pixel's hue. hsv() "wraps" hue between 0.0 and 1.0.
*/
export function render(index) {
  // Look up the current mode function and call it
  v = modes[mode](4 * index / pixelCount, t)
  
  
  // The core of the oscillation is a triangle wave, bouncing across two total
  // strip lengths. The 1D version removes the rotation element.
  v2 = triangle(2 * wave(t1) + index / pixelCount)
  
  // Aggressive gamma correction looks good, reduces the pulse width, and makes
  // the dimmer parts of the pulse very smooth on APA102s / SK9822s.
  v3 = pow(v2, 5)
  
  s2 = v3 < .9  // For the top 0.1 (10%) of brightness values, make it white
  p1 = abs(0.5-tfade)*2
  p2 = abs(1-p1)
  h = p1 * t1 + p2 * 0
  s = p1 * s2 + p2 * 0
  v4 = p1 * v3 + p2 * v
  if (index < pixelCount/2) {
    hsv(t1,s2,v3)
  } else if (index >= pixelCount/2) {
    hsv(0,0,v)
  }
  //hsv(t1, s2, v3)
  
  //hsv(0, 0, v)
 // hsv (h,s,v)
}