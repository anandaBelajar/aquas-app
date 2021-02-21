/*
 * turn the pump function
 * 
 */
void turnPump(String message){

  if(message == "off") {
    digitalWrite(pump, HIGH);
    client.publish("aquas/remove-loader", "pump/Off");
    
  }   //turn the pump off
  else if(message == "on") {
    digitalWrite(pump, LOW);
    client.publish("aquas/remove-loader", "pump/On");
  } //turn the pump on
  

}
