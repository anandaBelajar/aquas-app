void init_fuzzy_ph_notification(){
//Start pH notification fuzzy input
FuzzyInput *fuzzy_ph_input = new FuzzyInput(1);
FuzzySet *ph_rendah = new FuzzySet(0, 0, 6, 6.5);
fuzzy_ph_input->addFuzzySet(ph_rendah);
FuzzySet *ph_normal = new FuzzySet(6, 6.5, 6.5, 7);
fuzzy_ph_input->addFuzzySet(ph_normal);
FuzzySet *ph_tinggi = new FuzzySet(6.7, 7, 14, 14);
fuzzy_ph_input->addFuzzySet(ph_tinggi);
//End pH notification fuzzy input

//Start ph notification fuzzy output
FuzzyOutput *fuzzy_ph_notif = new FuzzyOutput(1);
FuzzySet *ph_pemberitahuan = new FuzzySet(0, 0, 1, 2);
fuzzy_ph_notif->addFuzzySet(ph_pemberitahuan);
FuzzySet *ph_tidak_ada_notif = new FuzzySet(1, 2, 3, 3);
fuzzy_ph_notif->addFuzzySet(ph_tidak_ada_notif);
//End ph notification fuzzy output

//Start ph notification fuzzy rule
FuzzyRuleAntecedent *ifPhRendah = new FuzzyRuleAntecedent(); 
ifPhRendah->joinSingle(ph_rendah);
FuzzyRuleConsequent *thenPhPemberitahuan = new FuzzyRuleConsequent();
thenPhPemberitahuan->addOutput(ph_pemberitahuan);
FuzzyRule *phNotifRuleOne = new FuzzyRule(1, ifPhRendah, thenPhPemberitahuan);

FuzzyRuleAntecedent *ifPhNormal = new FuzzyRuleAntecedent(); 
ifPhNormal->joinSingle(ph_normal);
FuzzyRuleConsequent *thenPhTidakAdaNotif = new FuzzyRuleConsequent();
thenPhTidakAdaNotif->addOutput(ph_tidak_ada_notif);
FuzzyRule *phNotifRuleTwo = new FuzzyRule(1, ifPhNormal, thenPhTidakAdaNotif);

FuzzyRuleAntecedent *ifPhTinggi = new FuzzyRuleAntecedent(); 
ifPhTinggi->joinSingle(ph_tinggi);
FuzzyRuleConsequent *thenPhPemberitahuanTwo = new FuzzyRuleConsequent();
thenPhPemberitahuanTwo->addOutput(ph_pemberitahuan);
FuzzyRule *phNotifRuleThree = new FuzzyRule(1, ifPhTinggi, thenPhPemberitahuanTwo);
//End ph notification fuzzy rule
}

void do_notification() {
  
  //dummy notification data
  int dummy_ph_input = random(0, 14);
  //end dummy notification data
  
  
  fuzzy->setInput(1, dummy_ph_input);
  fuzzy->fuzzify();
  float ph_fuzzy_output = fuzzy->defuzzify(1);

  Serial.print("ph fuzzy output: ");
  Serial.println(ph_fuzzy_output);
}
