//Include library yang diperlukan
#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <BH1750.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Fuzzy.h>

Fuzzy *fuzzy = new Fuzzy(); //Inisiasi fuzzy object

//Inisiasi mqtt dan wfifi credential
const char* ssid = "";
const char* password = "";
const char* mqttServer = "";
const int mqttPort = 1883;
const char* mqttUser = "";
const char* mqttPassword = "";

//WiFi dan MQTT client
WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

//Inisiasi aktuator pin
#define pump 19
#define growlight 18
#define growlight2 23
Servo myservo;
#define servoPin 13

//Variabel dan pin ultrasonic
#define trigPin 12
#define echoPin 14
long duration;
int distance;

//Inisiasi bh1750
BH1750 lightMeter;

//Inisiasi pin dan variabel ds18b20
const int oneWireBus = 4;     
OneWire oneWire(oneWireBus);
DallasTemperature tempSensor(&oneWire);

//Inisiasi pin and variable e201c
const int phPin  = 34;
double Po = 0;
const int numReadings = 20;

//Inisiasi array dan variable MQTT packet
String ultrasonic_str;
char ultrasonic[50];
String light_str;
char light[50];
String temp_str;
char temprature[200];
String ph_str;
char ph[200];

//Inisiasi global variabel nilai sensor
float global_ph_value;
float global_temp_value;
float global_ultrasonic_value;
float global_light_value;

//Global variabel status aktuator
String growlight_automation_state = "auto";
String servo_automation_state = "auto";

int server_time; //Global varible waktu server

void setup() {
  Serial.begin(115200);

  //Start fuzzy ineference system
  init_fuzzy_ph_notification();
  init_fuzzy_temp_notification();
  init_fuzzy_feed_notification();
  init_fuzzy_lighting();

  //Start koneksi WiFi and MQTT
  setup_wifi();
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);

  //Start aktuator pinmode
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  myservo.setPeriodHertz(50);
  myservo.attach(servoPin, 500, 2400);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(pump, OUTPUT);
  pinMode(growlight, OUTPUT);
  pinMode (phPin, INPUT);

  //Matikan pompa dan growlight saat pertama kali sistem dijalankan
  digitalWrite(pump, HIGH);
  digitalWrite(growlight, HIGH);

  tempSensor.begin(); //Mulai pembaccan sensor suhu

  //Inisiasi I2C bus (BH1750)
  Wire.begin();
  lightMeter.begin();

}

void loop() {
  //function reconnect MQTT
  if (!client.connected()) {
    reconnect();
  }
  client.loop(); //loop koneksi

  //kirimkan sensor data ke server setiap satu detik dan lakukan fuzzifikasi
  long now = millis();
  if (now - lastMsg > 1000) {
    
    send_sensor_data();
    
    do_notification_fuzzy();
  
    if(growlight_automation_state == "auto"){
      do_lighting_fuzzy();
    }
    lastMsg = now;
  }
}
