#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <BH1750.h> //BH1750 light sensor library
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Fuzzy.h>

Fuzzy *fuzzy = new Fuzzy();

//const char* mqttServer = "aquas-app.site";

const char* ssid = "";
const char* password = "";
const char* mqttServer = "";
const int mqttPort = 1883;
const char* mqttUser = "";
const char* mqttPassword = "";

WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

Servo myservo;

//Start define actuator pin
#define pump 19
#define growlight 18
#define growlight2 23
#define servoPin 13
//End define actuator pin

//Start define ultrasonic 
#define trigPin 12 //(hijau)
#define echoPin 14 //(putih)
long duration;
int distance;
//End define ultrasnoic

//Start define BH1750
//BH1750 pin SDA = 21 (putih) SCL = 22 (kuning)
BH1750 lightMeter;
//End define BH1750

//Start define DS18B20
const int oneWireBus = 4;     
// Setup a oneWire instance to communicate with any OneWire devices
OneWire oneWire(oneWireBus);
// Pass our oneWire reference to Dallas Temperature sensor 
DallasTemperature tempSensor(&oneWire);
//END defineDS18B20

//Start define E201C
const int phPin  = 34;
double Po = 0;
const int numReadings = 20;
//End define E201C


//Start Define sensor array and variable for MQTT
String ultrasonic_str; //variable to hold string converted moisture value
char ultrasonic[50]; //array to hold moisture value message package
String light_str; //variable to hold string converted light value
char light[50]; //array to hold light value message package
String temp_str; //variable to hold string converted light value
char temprature[200]; //array to hold light value message package
String ph_str; //variable to hold string converted light value
char ph[200]; //array to hold light value message package
//End Define sensor array and variable for MQTT

float global_ph_value;
float global_temp_value;
float global_ultrasonic_value;
float global_light_value;

String growlight_automation_state = "auto";
String servo_automation_state = "auto";

int server_time;


void setup() {
  Serial.begin(115200);

  init_fuzzy_ph_notification();
  init_fuzzy_temp_notification();
  init_fuzzy_feed_notification();
  init_fuzzy_lighting();

  setup_wifi();
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  myservo.setPeriodHertz(50);    // standard 50 hz servo
  myservo.attach(servoPin, 500, 2400);

  //start actuator pinmode
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(pump, OUTPUT);
  pinMode(growlight, OUTPUT);
  pinMode (phPin, INPUT);
  //end actuator pinmode 

  //turn of the pump and growlight when the system started
  digitalWrite(pump, HIGH);
  digitalWrite(growlight, HIGH);

   //Start define temp sensor
  tempSensor.begin();
  //End define temp sensor

  // Start Initialize the I2C bus (BH1750)
  Wire.begin();
  lightMeter.begin();
  // End Initialize the I2C bus (BH1750)
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

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
