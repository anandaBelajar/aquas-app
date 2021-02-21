/*
 * get the light value function
 * 
 * @return float
 */
float get_light_value() {
  
  float lux = lightMeter.readLightLevel();
  //Serial.print("Light: ");
  //Serial.print(lux);
  //Serial.println(" lx");

  global_light_value = lux;

  return lux;
  
}
