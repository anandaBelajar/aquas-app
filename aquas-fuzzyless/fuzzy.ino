/*
 * Function untuk menjalankan notifikasi
 */
void do_notification() {

  //kirimkan notifikasi ke server berdasarkan nilai sensor
  if(global_ph_value < 1.5){
    client.publish("aquas/mail", "peringatan_ph");
    //Serial.println("mail sent");
  }
  
  if(global_temp_value < 1.5){
    client.publish("aquas/mail", "peringatan_suhu");
  }
 
  if(global_ultrasonic_value < 1.5){
    client.publish("aquas/mail", "pemberitahuan_pakan");
  }else if(global_ultrasonic_value > 2.5){
    client.publish("aquas/mail", "peringatan_pakan");
  }
 
}


/*
 * function untuk menjalankan pencahayaan
 */
void do_lighting(){

  //hidupkan atau matikan growlight berdasarkan nilai sensor
  if(growlight_automation_state == "auto"){
    if(global_light_value < 6906 && server_time > 7 && server_time < 19){
      turnGrowlight("on");
    }else {
      turnGrowlight("off");
    }
  }
}
