import { pixelblazeClients } from 'app/pixelblaze/clients/pixelblaze-clients';
import { PneumaticsModelSingleton } from 'domain/controllers/pneumatics-controller';
import { PneumaticsCommandTextMessage } from 'domain/controllers/types';
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
  const commandMessage: PneumaticsCommandTextMessage = {
    type: 'pneumaticsCommandText',
    command: "lowerStarboardBow",
    sendTime: new Date().toISOString(),
  }
  PneumaticsModelSingleton.getInstance().model.handleCommand(commandMessage)
  const params = {
    TRIGGER_SEGMENT_CHANGE: 1,
  }
  pixelblazeClients.forEach(client => {
    if (client.isConnected()) {
        client.sendVars(params);
    } else {
        console.log(`Cannot send pattern to ${client.name}: not connected`);
    }
});
});

console.log('Listening for MIDI messages.');

}

export { startMidiServer }