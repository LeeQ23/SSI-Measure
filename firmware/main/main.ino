#include "HX711.h"

// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 22;
const int LOADCELL_SCK_PIN = 23;

HX711 scale;

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing the scale");

  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

  scale.set_scale(-993.6f);

  
  // Give the HX711 chip 2 seconds to stabilize before setting the zero point
  delay(2000); 
  scale.tare(); // Reset the scale to 0

  Serial.println("Readings:");
}

void loop() {
  if (scale.is_ready()) {
    // Get moving average of 10 readings for stability
    float reading = scale.get_units(10);
    
    // Print in a structured format so Node.js can easily parse it
    Serial.print("WEIGHT:");
    Serial.println(reading, 1);
  } else {
    Serial.println("HX711 not found.");
  }
  delay(100); // Send data roughly 10 times a second
}
