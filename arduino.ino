// /*************************************************************
//  * STITCHCRAFT 3D — ADXL345 + TOUCH CONFIRMATION
//  *
//  * - ADXL345: adivinha o tipo de ponto pelo movimento
//  * - Touch sensor: confirma o ponto e dispara SOM no browser
//  *
//  * O Arduino NÃO gera som.
//  * Ele envia texto → Web Audio
//  *************************************************************/

// #include <Wire.h>
// #include <Adafruit_Sensor.h>
// #include <Adafruit_ADXL345_U.h>

// /* =========================================================
//    ========== PINOS =========================================
//    ========================================================= */

// const int PIN_TOQUE = 2;   // Sensor de toque KS0012 (D2)

// /* =========================================================
//    ========== SENSOR DE MOVIMENTO ===========================
//    ========================================================= */

// Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

// /* =========================================================
//    ========== CONFIGURAÇÕES ================================
//    ========================================================= */

// float MOVEMENT_THRESHOLD = 1.3;      // Sensibilidade do gesto
// unsigned long COOLDOWN = 300;        // Anti-duplicação
// String currentStitch = "";           // Último ponto detectado

// /* =========================================================
//    ========== SETUP =========================================
//    ========================================================= */

// void setup() {

//   Serial.begin(9600);
//   Wire.begin();

//   pinMode(PIN_TOQUE, INPUT);

//   if (!accel.begin()) {
//     Serial.println("ADXL345 nao encontrado");
//     while (1);
//   }

//   accel.setRange(ADXL345_RANGE_4_G);

//   Serial.println("Sistema pronto");
// }

// /* =========================================================
//    ========== FUNÇÕES AUXILIARES =============================
//    ========================================================= */

// float motionMagnitude(float x, float y, float z) {
//   return sqrt(x * x + y * y + z * z);
// }

// /*
//  * Classificação heurística do ponto
//  */
// String classifyStitch(unsigned long duration) {

//   if (duration < 200) return "sc";
//   if (duration < 350) return "hdc";
//   if (duration < 550) return "dc";
//   return "tr";  // treble crochet
// }

// /* =========================================================
//    ========== LOOP PRINCIPAL ================================
//    ========================================================= */

// void loop() {

//   static bool inMotion = false;
//   static unsigned long motionStart = 0;
//   static unsigned long lastEventTime = 0;

//   // ---- LEITURA DO ACELERÓMETRO ----
//   sensors_event_t event;
//   accel.getEvent(&event);

//   float magnitude = motionMagnitude(
//     event.acceleration.x,
//     event.acceleration.y,
//     event.acceleration.z
//   );

//   // Início do gesto
//   if (!inMotion && magnitude > MOVEMENT_THRESHOLD) {
//     inMotion = true;
//     motionStart = millis();
//   }

//   // Fim do gesto
//   if (inMotion && magnitude < MOVEMENT_THRESHOLD) {

//     unsigned long duration = millis() - motionStart;

//     // Classifica e guarda (NÃO envia ainda!)
//     currentStitch = classifyStitch(duration);

//     inMotion = false;
//   }

//   // ---- SENSOR DE TOQUE = CONFIRMAÇÃO + SOM ----
//   if (digitalRead(PIN_TOQUE) == HIGH) {

//     // Evita múltiplos toques seguidos
//     if (millis() - lastEventTime > COOLDOWN && currentStitch != "") {

//       /*
//        * Enviamos o ponto NORMALMENTE
//        * A Web App:
//        *  - desenha
//        *  - toca som específico
//        */
//       Serial.println(currentStitch);

//       lastEventTime = millis();
//     }

//     delay(200); // debounce simples
//   }

//   delay(10);
// }