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
