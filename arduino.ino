// #include <Wire.h>
// #include <Adafruit_Sensor.h>
// #include <Adafruit_ADXL345_U.h>

// const int PIN_TOQUE = 2;

// Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

// // ---- Thresholds (meio termo) ----
// float START_THRESHOLD = 6.2;
// float STOP_THRESHOLD  = 4.8;

// // ---- Filtro ----
// float filteredX = 0;
// float alpha = 0.32;

// // ---- Estados ----
// bool inMotion = false;
// unsigned long motionStart = 0;

// // ---- Estabilidade ----
// unsigned long stableStartTime = 0;
// unsigned long MIN_MOTION_TIME = 90;

// // ---- Cooldown entre pontos ----
// unsigned long lastStitchTime = 0;
// unsigned long STITCH_COOLDOWN = 300;

// // ---- Toque ----
// bool lastTouchState = HIGH;
// unsigned long lastTouchTime = 0;
// unsigned long TOUCH_COOLDOWN = 400;

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

//   float rawX = event.acceleration.x;

//   filteredX = alpha * rawX + (1 - alpha) * filteredX;
//   float absX = abs(filteredX);

//   // ---- DETEÇÃO DE INÍCIO ----
//   if (!inMotion && absX > START_THRESHOLD) {

//     if (stableStartTime == 0)
//       stableStartTime = millis();

//     if (millis() - stableStartTime > MIN_MOTION_TIME) {
//       inMotion = true;
//       motionStart = millis();
//     }

//   } else {
//     stableStartTime = 0;
//   }

//   // ---- PREVIEW ----
//   if (inMotion) {
//     unsigned long elapsed = millis() - motionStart;
//     Serial.print("preview:");
//     Serial.println(classifyStitch(elapsed));
//   }

//   // ---- DETEÇÃO DE FIM ----
//   if (inMotion && absX < STOP_THRESHOLD) {

//     unsigned long duration = millis() - motionStart;

//     if (millis() - lastStitchTime > STITCH_COOLDOWN) {
//       Serial.println(classifyStitch(duration));
//       lastStitchTime = millis();
//     }

//     inMotion = false;
//   }

//   // ----------- TOQUE -----------
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

//   delay(15);
// }