// // Pinos dos sensores Keyestudio
// const int PIN_TOQUE = 2;   // KS0012 conectado no pino Digital 2
// const int PIN_POT = A0;    // KS0031 conectado no pino Analógico 0

// String pontos[] = {"sc", "dc", "hdc", "tr", "inc", "dec", "slst"};
// int ultimoIndice = -1;

// void setup() {
//   Serial.begin(9600); // Velocidade de comunicação
//   pinMode(PIN_TOQUE, INPUT);
// }

// void loop() {
//   // 1. Lógica do Seletor (Potenciômetro)
//   int valorPot = analogRead(PIN_POT);
//   int indicePonto = map(valorPot, 0, 1023, 0, 6); // Divide 1024 valores por 7 tipos de pontos
  
//   if (indicePonto != ultimoIndice) {
//     // Envia o "preview" para o app destacar o ponto na barra lateral
//     Serial.println("preview:" + pontos[indicePonto]);
//     ultimoIndice = indicePonto;
//   }

//   // 2. Lógica do Gatilho (Touch)
//   if (digitalRead(PIN_TOQUE) == HIGH) {
//     // Envia o comando para desenhar o ponto na tela
//     Serial.println(pontos[indicePonto]);
//     delay(500); // Evita duplicar pontos por um único toque
//   }
//   delay(50);
// }