void init_mqtt() {
  while (!client.connected()) {
  Serial.println("Connecting to MQTT...");
 
  if (client.connect("ESP32Client", mqttUser, mqttPassword )) {
 
    Serial.println("connected");
 
  } else {
 
    Serial.print("failed with state ");
    Serial.print(client.state());
    delay(2000);
 
    }
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("arduinoClientNikmat")) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("outTopic","hello world");
      // ... and resubscribe
      client.subscribe("aquas/pump");
      client.subscribe("aquas/servo");
      client.subscribe("aquas/growlight");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {

  Serial.print("Message arrived in topic: ");
  Serial.println(topic);
 
  String message;
  for (int i = 0; i < length; i++) {
    message = message + (char)payload[i];  //Conver *byte to String
  }
  Serial.print(message);
  Serial.println();
  Serial.println("-----------------------");
 
 if (strcmp(topic,"aquas/pump")==0){
    // whatever you want for this topic
    turnPump(message);
    Serial.println("pump");
  }
 
  if (strcmp(topic,"aquas/servo_auto")==0) {
    // obvioulsy state of my red LED
    turnServoAuto(message);
    Serial.println("servo");
  }

  if (strcmp(topic,"aquas/servo_manual")==0) {
    // obvioulsy state of my red LED
    turnServoManual(message);
    Serial.println("servo");
  }

   if (strcmp(topic,"aquas/growlight")==0) {
    if(message == "auto") {
      growlight_automation_state = "auto";
    }   
    else if(message == "manual") {
      growlight_automation_state = "manual";
    }
    Serial.println("growlight state");
  }
 
  if (strcmp(topic,"aquas/growlight_manual")==0) {
    // this one is blue...
    turnGrowlightManual(message);
    Serial.println("growlight");
  }

  if(growlight_automation_state == "auto"){
    if (strcmp(topic,"aquas/time")==0) {
      turnGrowlightAuto(message);
    }
  }
}

void send_sensor_data(){
  
  ultrasonic_str = String(get_ultrasonic_value());
  ultrasonic_str.toCharArray(ultrasonic, ultrasonic_str.length() + 1);
  //publish the package of light sensor value to the broker

  light_str = String(get_light_value());
  light_str.toCharArray(light, light_str.length() + 1);
  //publish the package of light sensor value to the broker

  temp_str = String(get_temp_value());
  temp_str.toCharArray(temprature, temp_str.length() + 1);
  //publish the package of light sensor value to the broker

  ph_str = String(get_ph_value());
  ph_str.toCharArray(ph, ph_str.length() + 1);
  //publish the package of light sensor value to the broker

  client.publish("aquas/light", light);
  client.publish("aquas/feed", ultrasonic);
  client.publish("aquas/temp", temprature);
  client.publish("aquas/ph", ph);
    
  
}
