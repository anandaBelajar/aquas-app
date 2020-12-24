void init_fuzzy_ph_notification(){
//Start pH notification fuzzy input
FuzzyInput *fuzzy_ph_input = new FuzzyInput(1);
FuzzySet *ph_rendah = new FuzzySet(0, 0, 6, 6.5);
fuzzy_ph_input->addFuzzySet(ph_rendah);
FuzzySet *ph_normal = new FuzzySet(5, 6.5, 6.5, 7);
fuzzy_ph_input->addFuzzySet(ph_normal);
FuzzySet *ph_tinggi = new FuzzySet(6.7, 7, 14, 14);
fuzzy_ph_input->addFuzzySet(ph_tinggi);
fuzzy->addFuzzyInput(fuzzy_ph_input);
//End pH notification fuzzy input

//Start ph notification fuzzy output
FuzzyOutput *fuzzy_ph_notif = new FuzzyOutput(1);
FuzzySet *ph_peringatan = new FuzzySet(0, 0, 1, 2);
fuzzy_ph_notif->addFuzzySet(ph_peringatan);
FuzzySet *ph_tidak_ada_notif = new FuzzySet(1, 2, 3, 3);
fuzzy_ph_notif->addFuzzySet(ph_tidak_ada_notif);
fuzzy->addFuzzyOutput(fuzzy_ph_notif);
//End ph notification fuzzy output

//Start ph notification fuzzy rule
FuzzyRuleAntecedent *ifPhRendah = new FuzzyRuleAntecedent(); 
ifPhRendah->joinSingle(ph_rendah);
FuzzyRuleConsequent *thenPhPeringatan = new FuzzyRuleConsequent();
thenPhPeringatan->addOutput(ph_peringatan);
FuzzyRule *phNotifRuleOne = new FuzzyRule(1, ifPhRendah, thenPhPeringatan);
fuzzy->addFuzzyRule(phNotifRuleOne);

FuzzyRuleAntecedent *ifPhNormal = new FuzzyRuleAntecedent(); 
ifPhNormal->joinSingle(ph_normal);
FuzzyRuleConsequent *thenPhTidakAdaNotif = new FuzzyRuleConsequent();
thenPhTidakAdaNotif->addOutput(ph_tidak_ada_notif);
FuzzyRule *phNotifRuleTwo = new FuzzyRule(2, ifPhNormal, thenPhTidakAdaNotif);
fuzzy->addFuzzyRule(phNotifRuleTwo);

FuzzyRuleAntecedent *ifPhTinggi = new FuzzyRuleAntecedent(); 
ifPhTinggi->joinSingle(ph_tinggi);
FuzzyRuleConsequent *thenPhPeringatanTwo = new FuzzyRuleConsequent();
thenPhPeringatanTwo->addOutput(ph_peringatan);
FuzzyRule *phNotifRuleThree = new FuzzyRule(3, ifPhTinggi, thenPhPeringatanTwo);
fuzzy->addFuzzyRule(phNotifRuleThree);
//End ph notification fuzzy rule
}

void init_fuzzy_temp_notification(){
FuzzyInput *fuzzy_temp_input = new FuzzyInput(2);
FuzzySet *temp_dingin = new FuzzySet(0, 0, 17, 22);
fuzzy_temp_input->addFuzzySet(temp_dingin);
FuzzySet *temp_normal = new FuzzySet(17, 22, 32, 34);
fuzzy_temp_input->addFuzzySet(temp_normal);
FuzzySet *temp_panas = new FuzzySet(32, 34, 50, 50);
fuzzy_temp_input->addFuzzySet(temp_panas);
fuzzy->addFuzzyInput(fuzzy_temp_input);
//End temp notification fuzzy input

//Start temp notification fuzzy output
FuzzyOutput *fuzzy_temp_notif = new FuzzyOutput(2);
FuzzySet *temp_peringatan = new FuzzySet(0, 0, 1, 2);
fuzzy_temp_notif->addFuzzySet(temp_peringatan);
FuzzySet *temp_tidak_ada_notif = new FuzzySet(1, 2, 3, 3);
fuzzy_temp_notif->addFuzzySet(temp_tidak_ada_notif);
fuzzy->addFuzzyOutput(fuzzy_temp_notif);
//End temp notification fuzzy output

//Start ph notification fuzzy rule
FuzzyRuleAntecedent *ifTempDingin = new FuzzyRuleAntecedent(); 
ifTempDingin->joinSingle(temp_dingin);
FuzzyRuleConsequent *thenTempPeringatan = new FuzzyRuleConsequent();
thenTempPeringatan->addOutput(temp_peringatan);
FuzzyRule *tempNotifRuleOne = new FuzzyRule(4, ifTempDingin, thenTempPeringatan);
fuzzy->addFuzzyRule(tempNotifRuleOne);

FuzzyRuleAntecedent *ifTempNormal = new FuzzyRuleAntecedent(); 
ifTempNormal->joinSingle(temp_normal);
FuzzyRuleConsequent *thenTempTidakAdaNotif = new FuzzyRuleConsequent();
thenTempTidakAdaNotif->addOutput(temp_tidak_ada_notif);
FuzzyRule *tempNotifRuleTwo = new FuzzyRule(5, ifTempNormal, thenTempTidakAdaNotif);
fuzzy->addFuzzyRule(tempNotifRuleTwo);

FuzzyRuleAntecedent *ifTempPanas = new FuzzyRuleAntecedent(); 
ifTempPanas->joinSingle(temp_panas);
FuzzyRuleConsequent *thenTempPeringatanTwo = new FuzzyRuleConsequent();
thenTempPeringatanTwo->addOutput(temp_peringatan);
FuzzyRule *tempNotifRuleThree = new FuzzyRule(6, ifTempPanas, thenTempPeringatanTwo);
fuzzy->addFuzzyRule(tempNotifRuleThree);
}

void init_fuzzy_feed_notification(){
FuzzyInput *fuzzy_feed_input = new FuzzyInput(3);
FuzzySet *feed_banyak = new FuzzySet(0, 0, 5, 8);
fuzzy_feed_input->addFuzzySet(feed_banyak);
FuzzySet *feed_sedang = new FuzzySet(5, 8, 11, 14);
fuzzy_feed_input->addFuzzySet(feed_sedang);
FuzzySet *feed_sedikit = new FuzzySet(11, 14, 17, 20);
fuzzy_feed_input->addFuzzySet(feed_sedikit);
FuzzySet *feed_habis = new FuzzySet(17, 20, 23, 23);
fuzzy_feed_input->addFuzzySet(feed_habis);
fuzzy->addFuzzyInput(fuzzy_feed_input);
//End temp notification fuzzy input

//Start temp notification fuzzy output
FuzzyOutput *fuzzy_feed_notif = new FuzzyOutput(3);
FuzzySet *feed_pemberitahuan = new FuzzySet(0, 0, 1, 2);
fuzzy_feed_notif->addFuzzySet(feed_pemberitahuan);
FuzzySet *feed_tidak_ada_notif = new FuzzySet(1, 2, 2, 3);
fuzzy_feed_notif->addFuzzySet(feed_tidak_ada_notif);
FuzzySet *feed_peringatan = new FuzzySet(2, 3, 4, 4);
fuzzy_feed_notif->addFuzzySet(feed_peringatan);
fuzzy->addFuzzyOutput(fuzzy_feed_notif);
//End temp notification fuzzy output

//Start ph notification fuzzy rule
FuzzyRuleAntecedent *ifFeedBanyak = new FuzzyRuleAntecedent(); 
ifFeedBanyak->joinSingle(feed_banyak);
FuzzyRuleConsequent *thenFeedTidakAdaNotif = new FuzzyRuleConsequent();
thenFeedTidakAdaNotif->addOutput(feed_tidak_ada_notif);
FuzzyRule *feedNotifRuleOne = new FuzzyRule(7, ifFeedBanyak, thenFeedTidakAdaNotif);
fuzzy->addFuzzyRule(feedNotifRuleOne);

FuzzyRuleAntecedent *ifFeedSedang = new FuzzyRuleAntecedent(); 
ifFeedSedang->joinSingle(feed_sedang);
FuzzyRuleConsequent *thenFeedTidakAdaNotifTwo = new FuzzyRuleConsequent();
thenFeedTidakAdaNotifTwo->addOutput(feed_tidak_ada_notif);
FuzzyRule *feedNotifRuleTwo = new FuzzyRule(8, ifFeedSedang, thenFeedTidakAdaNotifTwo);
fuzzy->addFuzzyRule(feedNotifRuleTwo);

FuzzyRuleAntecedent *ifFeedSedikit = new FuzzyRuleAntecedent(); 
ifFeedSedikit->joinSingle(feed_sedikit);
FuzzyRuleConsequent *thenFeedPemberitahuan = new FuzzyRuleConsequent();
thenFeedPemberitahuan->addOutput(feed_pemberitahuan);
FuzzyRule *feedNotifRuleThree = new FuzzyRule(9, ifFeedSedikit, thenFeedPemberitahuan);
fuzzy->addFuzzyRule(feedNotifRuleThree);

FuzzyRuleAntecedent *ifFeedHabis = new FuzzyRuleAntecedent(); 
ifFeedHabis->joinSingle(feed_habis);
FuzzyRuleConsequent *thenFeedPeringatan = new FuzzyRuleConsequent();
thenFeedPeringatan->addOutput(feed_peringatan);
FuzzyRule *feedNotifRuleFour = new FuzzyRule(10, ifFeedHabis, thenFeedPeringatan);
fuzzy->addFuzzyRule(feedNotifRuleFour);
}

void init_fuzzy_lighting(){
FuzzyInput *fuzzy_light_input = new FuzzyInput(4);
FuzzySet *light_redup = new FuzzySet(6233, 6233, 6733, 6906);
fuzzy_light_input->addFuzzySet(light_redup);
FuzzySet *light_terang = new FuzzySet(6733, 6906, 7406, 7406);
fuzzy_light_input->addFuzzySet(light_terang);
fuzzy->addFuzzyInput(fuzzy_light_input);

FuzzyInput *fuzzy_time_input = new FuzzyInput(5);
FuzzySet *time_subuh = new FuzzySet(0, 0, 6, 7);
fuzzy_time_input->addFuzzySet(time_subuh);
FuzzySet *time_optimal = new FuzzySet(6, 7, 19, 20);
fuzzy_time_input->addFuzzySet(time_optimal);
FuzzySet *time_malam = new FuzzySet(19, 20, 24, 24);
fuzzy_time_input->addFuzzySet(time_malam);
fuzzy->addFuzzyInput(fuzzy_time_input);
//End temp notification fuzzy input

//Start temp notification fuzzy output
FuzzyOutput *fuzzy_lighting = new FuzzyOutput(4);
FuzzySet *growlight_hidup = new FuzzySet(0, 0, 1, 2);
fuzzy_lighting->addFuzzySet(growlight_hidup);
FuzzySet *growlight_mati = new FuzzySet(1, 2, 3, 3);
fuzzy_lighting->addFuzzySet(growlight_mati);
fuzzy->addFuzzyOutput(fuzzy_lighting);
//End temp notification fuzzy output

//Start ph notification fuzzy rule
FuzzyRuleAntecedent *ifRedupAndSubuh = new FuzzyRuleAntecedent(); 
ifRedupAndSubuh->joinWithAND(light_redup, time_subuh); 
FuzzyRuleConsequent *thenGrowlightMati = new FuzzyRuleConsequent();
thenGrowlightMati->addOutput(growlight_mati);
FuzzyRule *lightingRuleOne = new FuzzyRule(11, ifRedupAndSubuh, thenGrowlightMati);
fuzzy->addFuzzyRule(lightingRuleOne);

//Start ph notification fuzzy rule
FuzzyRuleAntecedent *ifRedupAndOptimal = new FuzzyRuleAntecedent(); 
ifRedupAndOptimal->joinWithAND(light_redup, time_optimal); 
FuzzyRuleConsequent *thenGrowlightHidup = new FuzzyRuleConsequent();
thenGrowlightHidup->addOutput(growlight_hidup);
FuzzyRule *lightingRuleTwo = new FuzzyRule(12, ifRedupAndOptimal, thenGrowlightHidup);
fuzzy->addFuzzyRule(lightingRuleTwo);

FuzzyRuleAntecedent *ifRedupAndMalam = new FuzzyRuleAntecedent(); 
ifRedupAndMalam->joinWithAND(light_redup, time_malam); 
FuzzyRuleConsequent *thenGrowlightMatiTwo = new FuzzyRuleConsequent();
thenGrowlightMatiTwo->addOutput(growlight_mati);
FuzzyRule *lightingRuleThree = new FuzzyRule(13, ifRedupAndMalam, thenGrowlightMatiTwo);
fuzzy->addFuzzyRule(lightingRuleThree);

FuzzyRuleAntecedent *ifTerangAndSubuh = new FuzzyRuleAntecedent(); 
ifTerangAndSubuh->joinWithAND(light_terang, time_subuh); 
FuzzyRuleConsequent *thenGrowlightMatiThree = new FuzzyRuleConsequent();
thenGrowlightMatiThree->addOutput(growlight_mati);
FuzzyRule *lightingRuleFour = new FuzzyRule(14, ifTerangAndSubuh, thenGrowlightMatiThree);
fuzzy->addFuzzyRule(lightingRuleFour);

FuzzyRuleAntecedent *ifTerangAndOptimal = new FuzzyRuleAntecedent(); 
ifTerangAndOptimal->joinWithAND(light_terang, time_optimal); 
FuzzyRuleConsequent *thenGrowlightMatiFour = new FuzzyRuleConsequent();
thenGrowlightMatiFour->addOutput(growlight_mati);
FuzzyRule *lightingRuleFive = new FuzzyRule(15, ifTerangAndOptimal, thenGrowlightMatiFour);
fuzzy->addFuzzyRule(lightingRuleFive);

FuzzyRuleAntecedent *ifTerangAndMalam = new FuzzyRuleAntecedent(); 
ifTerangAndMalam->joinWithAND(light_terang, time_malam); 
FuzzyRuleConsequent *thenGrowlightMatiFive = new FuzzyRuleConsequent();
thenGrowlightMatiFive->addOutput(growlight_mati);
FuzzyRule *lightingRuleSix = new FuzzyRule(16, ifTerangAndMalam, thenGrowlightMatiFive);
fuzzy->addFuzzyRule(lightingRuleSix);
}

void do_fuzzy() {
  
  //dummy notification data
  int dummy_ph_input = random(0, 14);
  int dummy_temp_input = random(0, 50);
  int dummy_feed_input = random(0, 23);
  int dummy_light_input = random(6233, 7406);
  int dummy_time_input = random(0, 24);
  //end dummy notification data
  
  fuzzy->setInput(1, get_ph_value());
  fuzzy->setInput(2, get_temp_value());
  fuzzy->setInput(3, get_ultrasonic_value());
  fuzzy->setInput(4, get_light_value());
  fuzzy->setInput(5, server_time);
  fuzzy->fuzzify();
  float ph_fuzzy_output = fuzzy->defuzzify(1);
  float temp_fuzzy_output = fuzzy->defuzzify(2);
  float feed_fuzzy_output = fuzzy->defuzzify(3);
  float lighting_fuzzy_output = fuzzy->defuzzify(4);

  Serial.println(server_time);

  if(ph_fuzzy_output < 1.5){
    client.publish("aquas/mail", "peringatan_ph");
    //Serial.println("mail sent");
  }

  if(temp_fuzzy_output < 1.5){
    client.publish("aquas/mail", "peringatan_suhu");
  }

  if(feed_fuzzy_output < 1.5){
    client.publish("aquas/mail", "pemberitahuan_pakan");
  }else if(feed_fuzzy_output > 2.5){
    client.publish("aquas/mail", "peringatan_pakan");
  }

  if(lighting_fuzzy_output < 1.5  && growlight_automation_state == "auto"){
    turnGrowlight("on");
  }else if(lighting_fuzzy_output >= 1.5  && growlight_automation_state == "auto"){
    turnGrowlight("off");
  }


  //Serial.println("...........................................");
  //Serial.print("ph fuzzy input: ");
  //Serial.println(dummy_ph_input);
  //Serial.print("ph fuzzy output: ");
  //Serial.println(ph_fuzzy_output);
  //Serial.println("...........................................");
  //Serial.print("temp fuzzy input: ");
  //Serial.println(dummy_temp_input);
  //Serial.print("temp fuzzy output: ");
  //Serial.println(temp_fuzzy_output);
  //Serial.println("...........................................");
  //Serial.print("feed fuzzy input: ");
  //Serial.println(dummy_feed_input);
  //Serial.print("feed fuzzy output: ");
  //Serial.println(feed_fuzzy_output);
  //Serial.println("...........................................");
  //Serial.print("light fuzzy input: ");
  //Serial.println(dummy_light_input);
  //Serial.print("time fuzzy input: ");
  //Serial.println(dummy_time_input);
  //Serial.print("feed fuzzy output: ");
  //Serial.println(lighting_fuzzy_output);
}
