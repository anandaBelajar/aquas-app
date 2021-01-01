/*
 * setup the wifi function
 * 
 */
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password); //connect to the WIFI

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

/*
 * MQTT callback function
 * 
 */
void callback(char* topic, byte* message, unsigned int length) {
  String serverMessage;
  
  for (int i = 0; i < length; i++) {
    serverMessage += (char)message[i];
  }
  
  //do something if message come from specific subscribed topic
  if (strcmp(topic,"aquas/pump")==0){
    turnPump(serverMessage);
  }

  if (strcmp(topic,"aquas/servo")==0) {
    turnServo(serverMessage);
  }

   if (strcmp(topic,"aquas/growlight")==0) {
    if(String(serverMessage) == "auto") {
      growlight_automation_state = "auto";
    }   
    else if(String(serverMessage) == "manual") {
      growlight_automation_state = "manual";
    }
  }
 
  if (strcmp(topic,"aquas/growlight_manual")==0) {
    turnGrowlight(serverMessage);
  }

  
  if (strcmp(topic,"aquas/time")==0) {
    server_time = serverMessage.toInt();
  }
}

/*
 * send sensor data to server function
 * 
 */
void send_sensor_data(){

  //convert the sensor integer value to char
  ultrasonic_str = String(get_ultrasonic_value());
  ultrasonic_str.toCharArray(ultrasonic, ultrasonic_str.length() + 1);

  light_str = String(get_light_value());
  light_str.toCharArray(light, light_str.length() + 1);

  temp_str = String(get_temp_value());
  temp_str.toCharArray(temprature, temp_str.length() + 1);

  ph_str = String(get_ph_value());
  ph_str.toCharArray(ph, ph_str.length() + 1);

  //publish the sensor value
  client.publish("aquas/light", light);
  client.publish("aquas/feed", ultrasonic);
  client.publish("aquas/temp", temprature);
  client.publish("aquas/ph", ph);
    
}


/*
 * MQTT reconnect function
 * 
 */
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP8266Client", mqttUser, mqttPassword)) {
      Serial.println("connected");
      // Subscribe to specific topic
      client.subscribe("aquas/pump");
      client.subscribe("aquas/growlight");
      client.subscribe("aquas/growlight_manual");
      client.subscribe("aquas/servo");
      client.subscribe("aquas/time");
      client.subscribe("aquas/remove-loader");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}
