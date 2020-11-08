void turnGrowlight(String message){
  if(message == "off") {digitalWrite(growlight, HIGH);}   //turn the pump off
  if(message == "on") {digitalWrite(growlight, LOW);} //turn the pump on
}
