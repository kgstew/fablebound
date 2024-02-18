// Fable Bound Pneumatic Controller
// Initial test code
// Burning Man 2024
// Nathan Koral


int sensorPin = 16;                       //Location of the pins for the sensor and valves on Teensy 4.1
int fillPin = 15;
int ventPin = 14;

bool Vent = false;                        //Variables for the state of the sensor and valves
bool Fill = false;
int pressure = -1;

void setup() {
  pinMode(sensorPin, INPUT);              //Initilize the pins for the sensor and valves
  pinMode(fillPin, OUTPUT);
  pinMode(ventPin, OUTPUT);
  
  digitalWrite(fillPin, LOW);             //Set the valves to closed at startup
  digitalWrite(ventPin, LOW);

  Serial.begin(115200);
  Serial.println("Fable Bound Test");
}


void loop() {
  pressure = analogRead(sensorPin);       //Read sensor

  Serial.print("Pressure: ");             //Display pressur value (0-1023)
  Serial.print(pressure);

  Serial.print("    Vent: ");             //Display valve state
  Serial.print(Vent);

  Serial.print("    Fill: ");
  Serial.println(Fill);
  
  if (Serial.available() > 0) {           //Check for a valve state change request in the serial monitor
    int input = -1;
    input = Serial.read();

    if (input == 118){                    //Reverse the state of the vent valve if serial sees "v"
      Vent = !Vent;
    }

    if (input == 102){                    //Reverse the state of the fill valve if serial sees "f"
      Fill = !Fill;
    }

  }

  if (Vent){                              //Set the valve pins to the current state
    digitalWrite(ventPin, HIGH);
  }else{
    digitalWrite(ventPin, LOW);
  }
  
  if (Fill){
    digitalWrite(fillPin, HIGH);
  }else{
    digitalWrite(fillPin, LOW);
  }

  delay(250);                             //Wait 250 milliseconds and repeat
}
