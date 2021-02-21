/*
 * get the ph value function
 * 
 * @return float
 */
float get_ph_value(){
   int pengukuranPh = analogRead(phPin);
   //Serial.print("Nilai ADC Ph: ");
   //Serial.println(pengukuranPh);
   double TeganganPh = 3.3 / 4095.0 * pengukuranPh;
   //Serial.print("TeganganPh: ");
   //Serial.println(TeganganPh, 3);
   ///Po = 7.00 + ((teganganPh7 - TeganganPh) / PhStep);
   //Po = 7.00 + ((2.4 - TeganganPh) / 0.17);
    //Po = 7.00 + ((2.6 - TeganganPh) / 0.17);
  Po = 7.00 + ((2.4 - TeganganPh) / 0.2);
   global_ph_value = Po;


  return Po;
}
