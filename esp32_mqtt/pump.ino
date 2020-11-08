void turnPump(String message){

  if(message == "off") {digitalWrite(pump, HIGH);}   //turn the pump off
  if(message == "on") {digitalWrite(pump, LOW);} //turn the pump on

}
