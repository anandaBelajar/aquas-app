/*
float get_ph_value(){
   int phMeasurement = analogRead(phPin);
   //Serial.print("Nilai ADC Ph: ");
   //Serial.println(phMeasurement);
   double voltPh = 5 / 1024.0 * phMeasurement;
   //Serial.print("TeganganPh: ");
   //Serial.println(voltPh, 3);
   ///Po = 7.00 + ((teganganPh7 - TeganganPh) / PhStep);
   Po = 7.00 + ((2.6 - voltPh) / 0.17);
   //Serial.print("Nilai PH cairan: ");
   //Serial.println(Po, 3);

  return Po;
}
*/

float get_ph_value(){
   int pengukuranPh = analogRead(phPin);
   Serial.print("Nilai ADC Ph: ");
   Serial.println(pengukuranPh);
   double TeganganPh = 3.3 / 4095.0 * pengukuranPh;
   Serial.print("TeganganPh: ");
   Serial.println(TeganganPh, 3);
      ///Po = 7.00 + ((teganganPh7 - TeganganPh) / PhStep);
   
   //Po = 7.00 + ((2.3 - TeganganPh) / 0.16); //ini bagus
   Po = 7.00 + ((2.4 - TeganganPh) / 0.16); //ini bagus2
   Po = 7.00 + ((2.4 - TeganganPh) / 0.17); //ini bagus3
   
  phTotal = phTotal - readings[readIndex];
  // read from the sensor:
  readings[readIndex] = Po;
  // add the reading to the phTotal:
  phTotal = phTotal + readings[readIndex];
  // advance to the next position in the array:
  readIndex = readIndex + 1;

  // if we're at the end of the array...
  if (readIndex >= numReadings) {
    // ...wrap around to the beginning:
    readIndex = 0;
  }

  // calculate the phAverage:
  phAverage = phTotal / numReadings;
   
   Serial.print("Nilai PH cairan: ");
   Serial.println(phAverage, 3);

  return phAverage;
}
