/*
 * turn the servo function
 */
void turnServo(String message) {

 
  if(message == "close") {
    myservo.write(0);
    client.publish("aquas/remove-loader", "servo/Tutup");
  }else if(message == "open") {
    myservo.write(25);
    client.publish("aquas/remove-loader", "servo/Buka");
  } //turn the pump on

}
