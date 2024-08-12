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


function signalPixelblaze(pixelBlazeNumber: number, newSegment: number) {
    const params = {
      PIXELBLAZE_NUMBER: pixelBlazeNumber,
      TRIGGER_SEGMENT_CHANGE: 1,
      NEW_SEGMENT: newSegment
    };
    // Find the specific Pixelblaze client

    // Check if the Pixelblaze exists in the array
    if (pixelBlazeNumber >= 0 && pixelBlazeNumber < pixelblazeClients.length) {
      const targetClient = pixelblazeClients[pixelBlazeNumber];
      
      if (targetClient.isConnected()) {
          targetClient.sendVars(params);
          console.log(`Sent pattern to Pixelblaze ${pixelBlazeNumber}`);
      } else {
          console.log(`Cannot send pattern to Pixelblaze ${pixelBlazeNumber}: not connected`);
      }
  } else {
      console.log(`Pixelblaze ${pixelBlazeNumber} not found in the client list`);
  }
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
          signalPixelblaze(0,0);
          signalPixelblaze(1,2);
          break;
        case 5:
          break;
        case 10:
          break;
        case 15:
          break;
        case 20:
          startPneumaticsPattern("inPort");
          signalPixelblaze(0,0);
          signalPixelblaze(1,2);
          signalPixelblaze(2,0);
          break;
        case 25:
            startPneumaticsPattern("setOutOnAdventure");
            signalPixelblaze(0,1);
            signalPixelblaze(1,1);
            signalPixelblaze(2,0);
          break;
        case 30:
            startPneumaticsPattern("intoTheUnknown");
            signalPixelblaze(0,2);
            signalPixelblaze(1,1);
            signalPixelblaze(2,0);
          break;
        case 35:
            startPneumaticsPattern("risingStorm");
            signalPixelblaze(0,3);
            signalPixelblaze(1,1);
            signalPixelblaze(2,0);
          break;
        case 40:
            startPneumaticsPattern("stormySeas");
            signalPixelblaze(0,3);
            signalPixelblaze(1,1);
            signalPixelblaze(2,0);
          break;
        case 45:
            startPneumaticsPattern("meetTheGods");
            signalPixelblaze(0,5);
            signalPixelblaze(1,1);
            signalPixelblaze(2,1);
          break;
        case 51:
          startPneumaticsPattern("trickstersPromise");
          break;
        case 55:
            break;
        case 60:
            startPneumaticsPattern("arrivingHome");
            signalPixelblaze(0,4);
            signalPixelblaze(1,1);
            signalPixelblaze(2,2);
            break;
        case 65:            
          break;
        case 70:
          startPneumaticsPattern("closeAllValves");
          signalPixelblaze(0,0);
          signalPixelblaze(1,1);
          signalPixelblaze(2,0);
          break;
        default:
          console.log(`Unhandled MIDI note: ${note}`);
      }
    } else if (status >= 128 && status <= 143 || (status >= 144 && status <= 159 && velocity === 0)) {
      // Note Off message or Note On with velocity 0 (treated as Note Off)
      patternController.stopPattern();
      console.log("Stopped current pattern");
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


