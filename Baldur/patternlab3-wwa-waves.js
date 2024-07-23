/* eslint-disable */
/*
  Blink fade
  
  Blink fade is a great pattern to get acquainted with arrays in Pixelblaze.
  
  An array is a numbered collection of values. In this pattern we use two
  arrays, one for the brightness value of each pixel, and one for the color hue
  of each pixel.
  
  It's all in the name: Each pixel will blink to life, then fade out. Since we
  store every pixel in an array and do most operations between frames, this
  is also an example of frame buffering. Most of the interesting code is in 
  beforeRender(), and render() just plucks out the precomputed values needed 
  for that pixel.
  
  Each pixel starts its lifespan with a random brightness value between 0 and
  1. Between every frame, we reduce each pixel's value in a linear way such
  that it loses 10% of full brightness every 200ms. That means a pixel that was
  "born" with a full 0.9999 brightness would take 2 seconds to decay.
  
  We know a pixel needs to be reincarnated when it's value (after reduction)
  has become negative. If that's the case, we rebirth it with a new random
  brightness value. It's new color is determined by two factors: a looping 
  timer, and the position of the pixel in the overall strip. Notice in the
  preview how the pixels in the center seem to originate new colors and that
  those colors propogate to the edges.
  
  An array element can be a function instead of a value. Check out the
  "Example: Modes and Waveforms" pattern to see that technique in action.
  
  And remember, if you forget any of this, it's all in the concise language
  reference right on this page below your code!
*/

/*
  This is how you make an array. `pixelCount` is a special variable provided in
  all patterns that is set to the total number of pixels configured in the 
  Settings tab. 
*/
values = array(pixelCount)
hues = array(pixelCount)
newValues = array(pixelCount)
newHues = array(pixelCount)
export var rotationAmount
// Global variable to keep track of accumulated movement
moveAccumulator = 0
// Global variables
loopCounter = 0
rotationInterval = 4000 // Adjust this to change how often rotation occurs
// Global variable to keep track of accumulated movement
moveAccumulator = 0
// Global variables
moveCounter = 0
export var moveCounter
export var rotationAmount = 0.0
export var frameCounter = 0
export var previousRotationAmount = 0
export var framesPerRotation

export function beforeRender(delta) {
  // Increment frame counter
  rotationAmount = 0
  frameCounter++

  // Rotate every X frames
  // Adjust this value to change rotation speed (higher number = slower rotation)
  framesPerRotation = 10//triangle(delta) * 6 - 2  // This will rotate approximately every 10 seconds at 60 FPS

  // Check if it's time to rotate
  if (frameCounter >= framesPerRotation) {
    rotationAmount = previousRotationAmount + 1//(rotationAmount + 1) % pixelCount
    previousRotationAmount = rotationAmount
    frameCounter = 0
    if (previousRotationAmount > 4) {
      rotationAmount = 1
      previousRotationAmount = 0
    }
    
  }

  // Loop through every pixel
  for (i = 0; i < pixelCount; i++) {
    // Calculate the new index after rotation
    newIndex = (i + rotationAmount + pixelCount) % pixelCount

    // Rotate the arrays
    newValues[i] = values[newIndex]
    newHues[i] = hues[newIndex]

    // Reduce the brightness
    newValues[i] -= 0.005 * delta * 0.1

    // If this pixel has faded fully off
    if (newValues[i] <= 0) {
      newValues[i] = random(1) // Bump it back up to a random number 0..1
      
      // Set the new color
      newHues[i] = time(4.6 / 65.536) + 0.2 * triangle(i / pixelCount)
    }
  }

  // Update the original arrays with the new values
  values = newValues
  hues = newHues
}

/*
  render() will be called once per pixel per frame, and `index` is the pixel's 
  position in the strip. The first pixel is index 0. If we have 60 total pixels 
  (pixelCount == 60), the last one would be index 59.
*/
export function render(index) {
  h = hues[index] * 0.33*1/1.2*0.4/0.33 + 0.6    // Keep the value between 0.67 and 1 ish - this will only hit the WW and Amber lights
  v = values[index]  // Retrieve the brightness value for this pixel
  v = v * v          // Gamma scaling: v is in 0..1 so this makes small v smaller 
	hsv(h, 1, v)       // Saturation is 1 -- no white is mixed in
}
