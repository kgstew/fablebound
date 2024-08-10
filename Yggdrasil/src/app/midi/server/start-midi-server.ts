import { pixelblazeClients } from 'app/pixelblaze/clients/pixelblaze-clients';
import { PneumaticsModelSingleton } from 'domain/controllers/pneumatics-controller';
import { PneumaticsCommandPatternName, PneumaticsCommandTextMessage } from 'domain/controllers/types';
import { Input } from 'midi';

const pneumaticsModel = PneumaticsModelSingleton.getInstance();
const patternController = pneumaticsModel.patternController;

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
if (input.getPortCount()) {
  input.openPort(0);
}


function signalPixelblaze(note: number) {
    const params = {
      TRIGGER_SEGMENT_CHANGE: 1,
      MIDI_NOTE: note
    };
    pixelblazeClients.forEach(client => {
      if (client.isConnected()) {
        client.sendVars(params);
      } else {
        console.log(`Cannot send pattern to ${client.name}: not connected`);
      }
    });
  }


function startPneumaticsPattern(patternName: PneumaticsCommandPatternName) {
    patternController.stopPattern(); // Stop any currently running pattern
    patternController.setPattern(patternName);
    patternController.startPattern();
    console.log(`Started pattern: ${patternName}`);
  }


  input.on('message', (deltaTime: number, message: number[]) => {
    console.log(`m: ${message} d: ${deltaTime}`);
    
    const [status, note, velocity] = message;
    
    // Check if it's a Note On message (status byte between 144-159) and velocity > 0
    if (status >= 144 && status <= 159 && velocity > 0) {
      switch(note) {
        case 0:
          startPneumaticsPattern("inPort");
          signalPixelblaze(note);
          break;
        case 5:
          signalPixelblaze(note);
          break;
        case 10:
          signalPixelblaze(note);
          break;
        case 15:
          signalPixelblaze(note);
          break;
        case 20:
          startPneumaticsPattern("inPort");
          signalPixelblaze(note);
          break;
        case 25:
            startPneumaticsPattern("setOutOnAdventure");
          signalPixelblaze(note);
          break;
        case 30:
            startPneumaticsPattern("intoTheUnknown");
          signalPixelblaze(note);
          break;
        case 35:
            startPneumaticsPattern("risingStorm");
          signalPixelblaze(note);
          break;
        case 40:
            startPneumaticsPattern("stormySeas");
          signalPixelblaze(note);
          break;
        case 45:
            startPneumaticsPattern("meetTheGods");
          signalPixelblaze(note);
          break;
        case 51:
          startPneumaticsPattern("trickstersPromise");
          signalPixelblaze(note);
          break;
        case 55:
            signalPixelblaze(note);
            break;
        case 60:
            startPneumaticsPattern("arrivingHome");
            signalPixelblaze(note);
            break;
        case 65:
          signalPixelblaze(note);
          break;
        case 70:
          signalPixelblaze(note);
          break;
        default:
          console.log(`Unhandled MIDI note: ${note}`);
      }
    } else if (status >= 128 && status <= 143 || (status >= 144 && status <= 159 && velocity === 0)) {
      // Note Off message or Note On with velocity 0 (treated as Note Off)
      patternController.stopPattern();
      console.log("Stopped current pattern");
      signalPixelblaze(note); // Signal Pixelblaze for Note Off as well
    }
  });

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


