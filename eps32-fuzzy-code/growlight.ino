/*
 * Function menghidupkan dan mematikan growlight
 */
void turnGrowlight(String message){
  
  if(message == "off") {
    digitalWrite(growlight, HIGH);
    client.publish("aquas/remove-loader", "growlight/Off");
  }
  else if(message == "on") {
    digitalWrite(growlight, LOW);
    client.publish("aquas/remove-loader", "growlight/On");
  }

}
