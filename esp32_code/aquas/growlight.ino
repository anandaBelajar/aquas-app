/*
 * turn the growlight function
 */
void turnGrowlight(String message){
  
  if(message == "off") {
    digitalWrite(growlight, HIGH);
    client.publish("aquas/remove-loader", "growlight/Off");
  }   //turn the pump off
  else if(message == "on") {
    digitalWrite(growlight, LOW);
    client.publish("aquas/remove-loader", "growlight/On");
  } //turn the pump on

}
