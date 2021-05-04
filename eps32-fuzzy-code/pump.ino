/*
 * function menghidupkan dan mematikan pompa
 * 
 */
void turnPump(String message){

  if(message == "off") {
    digitalWrite(pump, HIGH);
    client.publish("aquas/remove-loader", "pump/Off");
    
  }
  else if(message == "on") {
    digitalWrite(pump, LOW);
    client.publish("aquas/remove-loader", "pump/On");
  }
  

}
