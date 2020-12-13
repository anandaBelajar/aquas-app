void turnGrowlightManual(String message){
  if(message == "off") {digitalWrite(growlight, HIGH);}   //turn the pump off
  if(message == "on") {digitalWrite(growlight, LOW);} //turn the pump on
}

void turnGrowlightAuto(String message){

  //bakal pake fuzzy disini
  
  if(message == "off") {digitalWrite(growlight, HIGH);}   //turn the pump off
  if(message == "on") {digitalWrite(growlight, LOW);} //turn the pump on
}
