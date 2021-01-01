/*
 * get the ph value function
 * 
 * @return float
 */
float get_ph_value(){
  int pengukuranPh = analogRead(phPin);
  double TeganganPh = 3.3 / 4095.0 * pengukuranPh;
  Po = 7.00 + ((2.4 - TeganganPh) / 0.17);
  global_ph_value = Po;

  return Po;
}
