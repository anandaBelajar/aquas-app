void turnGrowlightManual(String message){
  if(message == "off") {
    digitalWrite(growlight, HIGH);
    digitalWrite(growlight2, HIGH);
  }   //turn the pump off
  else if(message == "on") {
    digitalWrite(growlight, LOW);
    digitalWrite(growlight2, LOW);digitalWrite(growlight, HIGH);
    digitalWrite(growlight2, HIGH);
  } //turn the pump on
}

void turnGrowlightAuto(String message){

  //bakal pake fuzzy disini
  
  if(message == "off") {
    digitalWrite(growlight, HIGH);
    digitalWrite(growlight2, HIGH);
  }   //turn the pump off
  else if(message == "on") {
    digitalWrite(growlight, LOW);
    digitalWrite(growlight2, LOW);
  } //turn the pump on
}
