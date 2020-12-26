void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* message, unsigned int length) {
  //Serial.print("Message arrived on topic: ");
  //Serial.print(topic);
  //Serial.print(". Message: ");
  String serverMessage;
  
  for (int i = 0; i < length; i++) {
    //Serial.print((char)message[i]);
    serverMessage += (char)message[i];
  }
  //Serial.println();
  
  if (strcmp(topic,"aquas/pump")==0){
    // whatever you want for this topic
    turnPump(serverMessage);
    //Serial.println("pump");
  }

  if (strcmp(topic,"aquas/servo")==0) {
    turnServo(serverMessage);
    //Serial.println("servo");
  }

   if (strcmp(topic,"aquas/growlight")==0) {
    if(String(serverMessage) == "auto") {
      growlight_automation_state = "auto";
    }   
    else if(String(serverMessage) == "manual") {
      growlight_automation_state = "manual";
    }
    //Serial.print("growlight state : ");
    //Serial.println(growlight_automation_state);
  }
 
  if (strcmp(topic,"aquas/growlight_manual")==0) {
    turnGrowlight(serverMessage);
    //Serial.println("growlight");
  }

  
  if (strcmp(topic,"aquas/time")==0) {
    server_time = serverMessage.toInt();
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

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP8266Client", mqttUser, mqttPassword)) {
      Serial.println("connected");
      // Subscribe
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
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
