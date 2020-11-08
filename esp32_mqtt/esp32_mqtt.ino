#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <BH1750.h> //BH1750 light sensor library
#include <OneWire.h> 
#include <DallasTemperature.h> //DS18B20 temp sensor value
 
const char* ssid = "ZTE_2.4G_7RTKSh";
const char* password = "42326120";
const char* mqttServer = "mqtt.eclipse.org";
const int mqttPort = 1883;
const char* mqttUser = "";
const char* mqttPassword = "";

Servo myservo;

int pos = 0;

unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE  (512)
char msg[MSG_BUFFER_SIZE];
int value = 0;
 
WiFiClient espClient;
PubSubClient client(espClient);

#define pump 19
#define growlight 18
#define servoPin 13

int status = WL_IDLE_STATUS;

//Start define ultrasonic 
#define trigPin 12
#define echoPin 14
long duration;
int distance;
//End define ultrasnoic

//Start define BH1750
//BH1750 pin SDA = 21 SCL = 22
BH1750 lightMeter;
//End define BH1750


//Start define DS18B20
#define ONE_WIRE_BUS 34
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);
//END defineDS18B20

//Start define E201C
const int phPin  = 35;
float Po = 0;  
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


void setup() {
 
  Serial.begin(115200);

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  myservo.setPeriodHertz(50);    // standard 50 hz servo
  myservo.attach(servoPin, 500, 2400);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(pump, OUTPUT);
  pinMode(growlight, OUTPUT);
  pinMode (phPin, INPUT); 


  digitalWrite(pump, HIGH);
  digitalWrite(growlight, HIGH);

  //Start define temp sensor
  tempSensor.begin();
  //End define temp sensor

  // Start Initialize the I2C bus (BH1750)
  Wire.begin();
  lightMeter.begin();
  // End Initialize the I2C bus (BH1750)

  init_wifi();
 
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
  init_mqtt();
 
 
}
 
void loop() {
  if (!client.connected()) {
      reconnect();
    }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > 1000) {
    send_sensor_data();
    lastMsg = now;
  }
}
