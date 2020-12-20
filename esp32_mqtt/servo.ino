/*
void turnServoManual(String message) {
  if(message == "close") {
    for (pos = 0; pos <= 180; pos += 1) { // goes from 0 degrees to 180 degrees
    // in steps of 1 degree
      myservo.write(pos);    // tell servo to go to position in variable 'pos'
      delay(15);             // waits 15ms for the servo to reach the position
    }
  }   //turn the pump off
  if(message == "open") {
    for (pos = 180; pos >= 0; pos -= 1) { // goes from 180 degrees to 0 degrees
      myservo.write(pos);    // tell servo to go to position in variable 'pos'
      delay(15);             // waits 15ms for the servo to reach the position
    }
  } //turn the pump on
}

void turnServoAuto(String message) {
  if(message == "close") {
    for (pos = 0; pos <= 180; pos += 1) { // goes from 0 degrees to 180 degrees
    // in steps of 1 degree
      myservo.write(pos);    // tell servo to go to position in variable 'pos'
      delay(15);             // waits 15ms for the servo to reach the position
    }
  }   //turn the pump off
  if(message == "open") {
    for (pos = 180; pos >= 0; pos -= 1) { // goes from 180 degrees to 0 degrees
      myservo.write(pos);    // tell servo to go to position in variable 'pos'
      delay(15);             // waits 15ms for the servo to reach the position
    }
  } //turn the pump on
}
*/

void turnServoManual(String message) {
  if(message == "close") {
    myservo.write(0);
  }   //turn the pump off
  if(message == "open") {
    myservo.write(30);
  } //turn the pump on
}

void turnServoAuto(String message) {
  if(message == "close") {
    myservo.write(0);
  }   //turn the pump off
  if(message == "open") {
    myservo.write(30);
  } //turn the pump on
}
