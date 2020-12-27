/*
 * get the temprature value function
 * 
 * @return float
 */
float get_temp_value() {
  tempSensor.requestTemperatures(); 
  float temperatureC = tempSensor.getTempCByIndex(0);
  global_temp_value = temperatureC;
  
  return temperatureC;
}
