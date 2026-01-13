// #include <Wire.h>
// #include <Adafruit_Sensor.h>
// #include <Adafruit_ADXL345_U.h>

// const int PIN_TOQUE = 2;

// Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

// float START_THRESHOLD = 10.3;
// float STOP_THRESHOLD  = 10.0;

// bool inMotion = false;
// unsigned long motionStart = 0;

// bool lastTouchState = HIGH;
// unsigned long lastTouchTime = 0;
// unsigned long TOUCH_COOLDOWN = 400;

// float motionMagnitude(float x, float y, float z) {
//   return sqrt(x * x + y * y + z * z);
// }

// String classifyStitch(unsigned long duration) {
//   if (duration < 200) return "sc";
//   if (duration < 350) return "hdc";
//   if (duration < 550) return "dc";
//   return "tr";
// }

// void setup() {
//   Serial.begin(9600);
//   Wire.begin();

//   pinMode(PIN_TOQUE, INPUT_PULLUP);

//   accel.begin();
//   accel.setRange(ADXL345_RANGE_4_G);
// }

// void loop() {
//   // ----------- ACELERÓMETRO -----------
//   sensors_event_t event;
//   accel.getEvent(&event);

//   float mag = motionMagnitude(
//     event.acceleration.x,
//     event.acceleration.y,
//     event.acceleration.z
//   );

//   if (!inMotion && mag > START_THRESHOLD) {
//     inMotion = true;
//     motionStart = millis();
//   }

//   if (inMotion) {
//     unsigned long elapsed = millis() - motionStart;
//     Serial.print("preview:");
//     Serial.println(classifyStitch(elapsed));
//   }

//   if (inMotion && mag < STOP_THRESHOLD) {
//     unsigned long duration = millis() - motionStart;
//     Serial.println(classifyStitch(duration));
//     inMotion = false;
//   }

//   // ----------- SENSOR DE TOQUE -----------
//   bool touchState = digitalRead(PIN_TOQUE);

//   if (
//     lastTouchState == HIGH &&
//     touchState == LOW &&
//     millis() - lastTouchTime > TOUCH_COOLDOWN
//   ) {
//     Serial.println("row");  
//     lastTouchTime = millis();
//   }

//   lastTouchState = touchState;

//   delay(20);
// }