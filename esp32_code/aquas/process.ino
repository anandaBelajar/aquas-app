
/*
 * do the notfication fuzzification and defuzzification function
 */
void do_notification() {

  //Send the notification based on specific sensor input
  if(global_ph_value < 5.5 || global_ph_value > 7.5){
    client.publish("aquas/mail", "peringatan_ph");
    //Serial.println("mail sent");
  }
  
  if(global_temp_value < 18 || global_temp_value > 30){
    client.publish("aquas/mail", "peringatan_suhu");
  }

  if(global_light_value > 19384){
    client.publish("aquas/mail", "peringatan_cahaya");
  }
 
  if(global_ultrasonic_value > 11 && global_ultrasonic_value <= 17){
    client.publish("aquas/mail", "pemberitahuan_pakan");
  }else if(global_ultrasonic_value > 17){
    client.publish("aquas/mail", "peringatan_pakan");
  }
 
}
