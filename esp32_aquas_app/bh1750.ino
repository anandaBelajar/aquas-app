float get_light_value() {
  
  float lux = lightMeter.readLightLevel();
  //Serial.print("Light: ");
  //Serial.print(lux);
  //Serial.println(" lx");

  return lux;
  
}
