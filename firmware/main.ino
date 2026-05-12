#include "HX711.h"

// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 22;
const int LOADCELL_SCK_PIN = 23;

HX711 scale;

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing the scale");

  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

  // You will need to calibrate this value. 
  // It is the value that your specific load cell returns for 1 unit of weight.
  // For example: scale.set_scale(2280.f); 
  scale.set_scale(1.f); // Default scale, needs calibration!
  scale.tare(); // Reset the scale to 0

  Serial.println("Readings:");
}

void loop() {
  if (scale.is_ready()) {
    // Get moving average of 10 readings for stability
    long reading = scale.get_units(10);
    
    // Print in a structured format so Node.js can easily parse it
    Serial.print("WEIGHT:");
    Serial.println(reading);
  } else {
    Serial.println("HX711 not found.");
  }
  delay(100); // Send data roughly 10 times a second
}
