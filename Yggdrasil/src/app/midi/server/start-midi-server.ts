import { Input } from 'midi';

const startMidiServer = async (
) => {

// Create a new input.
const input = new Input();

// Count the available input ports.
const portCount = input.getPortCount();
console.log(`Available MIDI input ports: ${portCount}`);

if (portCount === 0) {
  console.log("No MIDI input ports available. Please set up a virtual MIDI port.");
}

// Get the name of a specified input port.
for (let i = 0; i < portCount; i++) {
  console.log(`Port ${i}: ${input.getPortName(i)}`);
}

// Open the first available input port.
input.openPort(0);

// Configure a callback.
input.on('message', (deltaTime: number, message: number[]) => {
  console.log(`m: ${message} d: ${deltaTime}`);
});

console.log('Listening for MIDI messages.');

}

export { startMidiServer }