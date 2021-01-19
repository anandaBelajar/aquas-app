/*
 * Function pembacaan sensor ph
 * 
 * @return float
 */
float get_ph_value(){
  int ph_measurement = analogRead(phPin);
  double ph_voltage = 3.3 / 4095.0 * ph_measurement;
  Po = 7.00 + ((2.4 - ph_voltage) / 0.2);
  global_ph_value = Po;

  return Po;
}
