// Dimension / Thickness Inspection Firmware for ESP32
// Detects state based on 3 pins. The spec asks for > 0.5V to be considered HIGH.
// We use analogRead() to precisely measure this threshold.
// ESP32 ADC is 12-bit (0-4095) for 0-3.3V. 
// 0.5V is approximately (0.5 / 3.3) * 4095 = 620.

const int PIN_OVER = 32;
const int PIN_UNDER = 33;
const int PIN_OK = 34;

const int THRESHOLD = 620; // Corresponds to ~0.5V

void setup() {
  Serial.begin(115200);
  
  // Note: Pins 34-39 on ESP32 are input only, no internal pull-ups.
  // Make sure your external circuit pulls them low when not active.
  pinMode(PIN_OVER, INPUT);
  pinMode(PIN_UNDER, INPUT);
  pinMode(PIN_OK, INPUT);
  
  Serial.println("Initializing Dimension Scanner...");
  delay(1000);
}

void loop() {
  int valOver = analogRead(PIN_OVER);
  int valUnder = analogRead(PIN_UNDER);
  int valOk = analogRead(PIN_OK);
  
  String currentState = "WAITING";
  
  // Logic: Priority goes to the pin that is over the 0.5V threshold.
  // If multiple are high, you could handle it as an error, 
  // but we will just use a simple if-else chain.
  if (valOver > THRESHOLD) {
      currentState = "OVER";
  } else if (valUnder > THRESHOLD) {
      currentState = "UNDER";
  } else if (valOk > THRESHOLD) {
      currentState = "OK";
  }
  
  // Output format required by the Node.js backend
  Serial.print("DIMENSION:");
  Serial.println(currentState);
  
  // Run loop at 10Hz to match the weight scale output rate roughly
  delay(100);
}
