
void turnServo(String message) {
  if(message == "close") {
    myservo.write(0);
  }   //turn the pump off
  if(message == "open") {
    myservo.write(30);
  } //turn the pump on
}
