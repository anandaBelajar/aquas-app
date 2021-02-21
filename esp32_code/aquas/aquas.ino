//include the necessary library
#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <BH1750.h>
#include <OneWire.h>
#include <DallasTemperature.h>

//start define WIFI and MQTT Credential
const char* ssid = "";
const char* password = "";
const char* mqttServer = "";
const int mqttPort = 1883;
const char* mqttUser = "";
const char* mqttPassword = "";

//define WIFI and MQTT client
WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

//Start define actuator pin
#define pump 19
#define growlight 18
#define growlight2 23
Servo myservo;
#define servoPin 13

//Define ultrasonic pin and variable
#define pingPin 14
//#define trigPin 12 //(kuning)
//#define echoPin 14 //(putih)
long duration;
int distance;

//Start define BH1750
//BH1750 pin SDA = 21 (putih) SCL = 22 (kuning)
BH1750 lightMeter;
//End define BH1750

//Start define DS18B20 pin and variable
const int oneWireBus = 4;     
// Setup a oneWire instance to communicate with any OneWire devices
OneWire oneWire(oneWireBus);
// Pass our oneWire reference to Dallas Temperature sensor 
DallasTemperature tempSensor(&oneWire);
//END defineDS18B20 pin and variable

//Start define E201C pin and variable
const int phPin  = 34;
double Po = 0;
const int numReadings = 20;
//End define E201C pin and variable


//Start define sensor array and variable for MQTT
String ultrasonic_str; //variable to hold string converted moisture value
char ultrasonic[50]; //array to hold moisture value message package
String light_str; //variable to hold string converted light value
char light[50]; //array to hold light value message package
String temp_str; //variable to hold string converted light value
char temprature[200]; //array to hold light value message package
String ph_str; //variable to hold string converted light value
char ph[200]; //array to hold light value message package
//End Define sensor array and variable for MQTT

//Start define sensor value global variable
float global_ph_value;
float global_temp_value;
float global_ultrasonic_value;
float global_light_value;
//End define sensor value global variable

//Start define global actuator state
String growlight_automation_state = "auto";
String servo_automation_state = "auto";
//end define actuator state

int server_time; //global varible form server time

void setup() {
  Serial.begin(115200);
  
  //Start init the connection to WIFI and MQTT
  setup_wifi();
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);

  //start actuator pinmode
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  myservo.setPeriodHertz(50);
  myservo.attach(servoPin, 500, 2400);
  //pinMode(trigPin, OUTPUT);
  //pinMode(echoPin, INPUT);
  pinMode(pump, OUTPUT);
  pinMode(growlight, OUTPUT);
  pinMode (phPin, INPUT);

  //turn of the pump and growlight when the system started
  digitalWrite(pump, HIGH);
  digitalWrite(growlight, HIGH);

  tempSensor.begin(); //start listen to temp sensor

  // Start Initialize the I2C bus (BH1750)
  Wire.begin();
  lightMeter.begin();

}

void loop() {
  //reconnect if the MQTT connection failed
  if (!client.connected()) {
    reconnect();
  }
  client.loop(); //loop the connection

  //send sensor data and do the fuzzification every one second
  long now = millis();
  if (now - lastMsg > 1000) {
    
    send_sensor_data();
    
    do_notification();
    
    lastMsg = now;
  }
}
