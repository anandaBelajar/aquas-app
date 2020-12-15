#include <Fuzzy.h>

// Instantiating a Fuzzy object
Fuzzy *fuzzy = new Fuzzy();

void setup()
{
   
  // Set the Serial output
  Serial.begin(115200);
  init_fuzzy_ph_notification();
  init_fuzzy_temp_notification();
  init_fuzzy_feed_notification();
  init_fuzzy_lighting();
}


void loop()
{
  do_notification();
  delay(5000);
}
