/*
 * Pembacaan sensor ultrasonic
 * 
 * @return float
 */
int get_ultrasonic_value() {
  
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;
  global_ultrasonic_value = distance;

  return distance;

  
}
