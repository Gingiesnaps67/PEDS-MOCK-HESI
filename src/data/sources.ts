/** Source inventory, coverage, and discrepancy log (generated from the 10/30/2026 source audit). */
export const SOURCE_FILES: { name: string; type: string; status: string; used: string }[] = [
 {
  "name": "Instructor HESI Review 2026 deck (69 topics)",
  "type": "PDF",
  "status": "Complete",
  "used": "All 69 topics → topic library, blueprint, items #1–69"
 },
 {
  "name": "Course PowerPoint: Basic Peds Nursing Care",
  "type": "PDF",
  "status": "Complete",
  "used": "Vital-sign table, motor/language milestones, activities, nutrition, immunizations, procedures"
 },
 {
  "name": "Course PowerPoint: Health Promotion 2026",
  "type": "PDF",
  "status": "Complete",
  "used": "Car-seat rules, injury prevention, tobacco/vaping, mental health"
 },
 {
  "name": "Course PowerPoint: Care of the Child with a Physical Disorder 2026",
  "type": "PDF",
  "status": "Complete",
  "used": "CHD, heme/onc, respiratory, GI, GU, endocrine, MSK, neuro, skin"
 },
 {
  "name": "Lecture 09/30 transcript",
  "type": "Text",
  "status": "Complete",
  "used": "Growth, vital signs, fontanels, Erikson, play, nutrition, vaccines, car seats, poisoning, suicide"
 },
 {
  "name": "Lecture 10/07 transcript",
  "type": "Text",
  "status": "Complete",
  "used": "Cardiac, heme, immune, respiratory"
 },
 {
  "name": "Lecture 10/08 transcript",
  "type": "Text",
  "status": "Complete",
  "used": "GI, GU, endocrine, MSK, neuro, skin"
 },
 {
  "name": "Textbook Ch30 — Dental Health & Injury Prevention",
  "type": "DOCX",
  "status": "Complete",
  "used": "Dental care, injury by age, poisoning, aspiration, burns, car seats"
 },
 {
  "name": "Textbook Ch30 — Key Health Promotion Topics",
  "type": "DOCX",
  "status": "Complete",
  "used": "Obesity, activity, tobacco, screen time, bullying, immunizations"
 },
 {
  "name": "Textbook Ch31 — Physical Assessment & G&D",
  "type": "DOCX",
  "status": "Complete",
  "used": "Vital-sign technique & averages, growth, nutrition, speech, communication"
 },
 {
  "name": "Textbook Ch31 — Common Procedures & Child Safety",
  "type": "DOCX",
  "status": "Complete",
  "used": "Gavage/G-tube, restraints, O₂, meds, injections, safety table"
 },
 {
  "name": "Textbook Ch31 — Maltreatment & Hospitalization",
  "type": "DOCX",
  "status": "Complete",
  "used": "Abuse indicators, reporting, hospitalization by age, pain, surgery prep"
 },
 {
  "name": "Textbook Ch31 — History & Overview",
  "type": "DOCX",
  "status": "Complete",
  "used": "Family-centered care, concepts of illness by age"
 },
 {
  "name": "Textbook Ch32 — Cardiovascular, Heme, Immune, Respiratory",
  "type": "DOCX",
  "status": "Complete",
  "used": "CHD, anemia, sickle cell, hemophilia, ITP, leukemia, HIV, JIA, RDS, croup, CF, asthma"
 },
 {
  "name": "Textbook Ch32 — GI, GU, Endocrine, MSK",
  "type": "DOCX",
  "status": "Complete",
  "used": "Cleft, dehydration, GER, pyloric, intussusception, Hirschsprung, renal, thyroid, diabetes, DDH, fractures"
 },
 {
  "name": "Textbook Ch32 — Neuro, Skin, Communicable, Sensory",
  "type": "DOCX",
  "status": "Complete",
  "used": "Meningitis, hydrocephalus, seizures, spina bifida, skin, communicable diseases, ears/eyes"
 },
 {
  "name": "Textbook Ch32 — Cognitive Disorders",
  "type": "DOCX",
  "status": "Complete",
  "used": "Down syndrome, autism, ADHD, depression, suicide, school avoidance, learning disabilities"
 },
 {
  "name": "ATI reading (7 chapters: school-age, vital signs, BP meds, leading/managing, enteral nutrition, GI, infection control)",
  "type": "DOCX",
  "status": "Complete (text; no embedded images in file)",
  "used": "Precautions, lisinopril/ACE, BP technique, G-tube/enteral, pyloric post-op, GI disorders"
 },
 {
  "name": "ATI reference: Developmental milestones",
  "type": "Text",
  "status": "Complete",
  "used": "5 stage cards, theorist table, activities; your 2 practice questions"
 },
 {
  "name": "ATI notes: Pediatric vital signs",
  "type": "Text",
  "status": "Complete",
  "used": "Ranges, BP table, technique; HTN definition flagged"
 },
 {
  "name": "Your HESI results report (10/16/2026)",
  "type": "PDF",
  "status": "Complete",
  "used": "Weak areas used to target new questions (GI 4/10, planning, evaluation)"
 }
];
export const DISCREPANCIES: { id: string; topic: string; sources: string; conflict: string; scoring: string }[] = [
 {
  "id": "D1",
  "topic": "Freud label",
  "sources": "ATI milestones table labels Freud row \"Psychosocial\"",
  "conflict": "Freud's stages are psychosexual (Erikson = psychosocial) — labeling error",
  "scoring": "Freud stage NAMES safe; never score the label word"
 },
 {
  "id": "D2",
  "topic": "Tympanic technique",
  "sources": "ATI vitals: \"gently pull the outer ear up\"; ATI DOCX: <3 y pinna down & back, ≥3 up & back; Ch31 (ear drops): ≤3 y down & back, >3 y up & back",
  "conflict": "vitals note gives one direction for all ages",
  "scoring": "Score ONLY age-split rule (DOCX+Ch31 agree); never score \"always up\""
 },
 {
  "id": "D3",
  "topic": "Tympanic minimum age",
  "sources": "ATI vitals: >6 months",
  "conflict": "(no conflicting source)",
  "scoring": "safe"
 },
 {
  "id": "D4",
  "topic": "Oral temp age",
  "sources": "ATI vitals: >4 y; Ch31: ~5–6 y",
  "conflict": "",
  "scoring": "score \"not for infants/toddlers\"; avoid exact cut-off"
 },
 {
  "id": "D5",
  "topic": "Temp range",
  "sources": "ATI vitals 36.1–37.2 °C; ATI DOCX oral 36–38, NB 36.5–37.5",
  "conflict": "ranges differ",
  "scoring": "do not score exact numbers"
 },
 {
  "id": "D6",
  "topic": "Toddler play",
  "sources": "ATI milestones: solitary/parallel (toddler); lecture + course PPT: parallel",
  "conflict": "",
  "scoring": "score PARALLEL as toddler hallmark"
 },
 {
  "id": "D7",
  "topic": "School-age growth",
  "sources": "ATI milestones 4.4–8.8 lb & ~2 in/yr; ATI DOCX 4.4–6.6 lb, 2.4–2.8 in",
  "conflict": "",
  "scoring": "don't score exact numbers"
 },
 {
  "id": "D8",
  "topic": "BP — HTN definition",
  "sources": "ATI vitals: \"after three readings above the 90th percentile\" (its quiz: on separate visits)",
  "conflict": "90th = elevated; HTN commonly ≥95th (user flagged)",
  "scoring": "NOT safe — not scored"
 },
 {
  "id": "D9",
  "topic": "BP table header",
  "sources": "ATI vitals column labeled \"BP Average (95th percentile)\"",
  "conflict": "a 95th percentile is not an average",
  "scoring": "show as written, flagged; not scored"
 },
 {
  "id": "D10",
  "topic": "Cuff size",
  "sources": "ATI DOCX: bladder width ~40% of arm circumference, encircles arm; Ch31: covers ~2/3 of upper arm, choose larger rather than smaller; ATI vitals: infant 6–15, child 16–21, adolescent 22–26 cm",
  "conflict": "different rules, compatible direction",
  "scoring": "score: too small → falsely HIGH; when in doubt larger; snug fit"
 },
 {
  "id": "D11",
  "topic": "HR/RR ranges",
  "sources": "course PPT (NB 100–160, instructor corrected to 110–160), ATI vitals (NB 110–160, infant 90–160, toddler 80–140, preschool 70–120, school 60–110, adolescent 50–100; RR 30–60/25–60/25–30/20–25/20–25/16–20), ATI DOCX (age 10+ 50–110), Ch31 Table 31.3 = averages",
  "conflict": "ranges differ by source",
  "scoring": "score only clearly-outside values (e.g., infant HR 60 or 220); show each source's table separately"
 },
 {
  "id": "D12",
  "topic": "No rectal",
  "sources": "ATI DOCX: no rectal <1 month",
  "conflict": "",
  "scoring": "safe (single source)"
 },
 {
  "id": "D13",
  "topic": "Hypothermia cut-off",
  "sources": "ATI DOCX \"<30 °C\"",
  "conflict": "likely typo vs common definitions",
  "scoring": "not scored"
 },
 {
  "id": "D14",
  "topic": "JNC/ASCVD text",
  "sources": "ATI DOCX \"ninth report of JNC 2025\", \"ASCVD <7.5%\" (adult HTN text)",
  "conflict": "adult/unverifiable",
  "scoring": "not scored"
 },
 {
  "id": "D15",
  "topic": "Cleft repair timing",
  "sources": "ATI: lip 3–6 mo, palate 6–12 mo; Ch32: lip first few months, palate by 18 mo; lecture: within first 2 y",
  "conflict": "",
  "scoring": "score \"lip before palate\"; not exact months"
 },
 {
  "id": "D16",
  "topic": "Cleft palate post-op position",
  "sources": "Cleft PALATE post-op: ATI side-lying; textbook Ch32 on the abdomen. Cleft LIP post-op: both say back or side, never prone. Review #43: rules vary by surgeon",
  "conflict": "",
  "scoring": "Score only: never prone after LIP repair; protect the suture line; follow the surgeon's plan"
 },
 {
  "id": "D17",
  "topic": "Pyloric post-op feeding",
  "sources": "ATI: clear liquids 4–8 h then formula/breast milk, full 24 h; Ch32: glucose water/electrolytes 4–6 h, full feeds by 24 h if retained",
  "conflict": "timing differs; pattern agrees",
  "scoring": "score \"small frequent clear → advance, burp, upright\"; not exact hours"
 },
 {
  "id": "D18",
  "topic": "Pyloric vomiting timing",
  "sources": "lecture 10–15 min; Ch32 30–60 min after feeding",
  "conflict": "",
  "scoring": "score \"projectile, nonbilious, after feeding, hungry\""
 },
 {
  "id": "D19",
  "topic": "Gavage placement",
  "sources": "Ch31: aspirate + air auscultation; ATI: x-ray initial, aspirate pH, auscultation not reliable",
  "conflict": "method conflict",
  "scoring": "score x-ray = most accurate for initial; don't score \"air auscultation confirms\""
 },
 {
  "id": "D20",
  "topic": "Post-gavage position",
  "sources": "Ch31 right side 1 h; ATI HOB ≥30° 30–60 min; PPT right side or semi-Fowler",
  "conflict": "compatible",
  "scoring": "score \"right side or HOB elevated\"; not supine flat"
 },
 {
  "id": "D21",
  "topic": "Coarctation lower pulses",
  "sources": "Ch32 \"bounding lower\"(error?); lecture/PPT/review: weak/delayed femoral",
  "conflict": "conflict",
  "scoring": "score WEAK femoral (3 sources) — app CONFLICT #8"
 },
 {
  "id": "D22",
  "topic": "Foreskin",
  "sources": "Ch31: do not retract infant foreskin; Ch32 UTI: retract & cleanse",
  "conflict": "conflict",
  "scoring": "not scored"
 },
 {
  "id": "D23",
  "topic": "Milk type toddler",
  "sources": "Ch30 <2 y whole or 2%; PPT whole until 2; Ch31 overview low-fat toddler; ATI 3–4 glasses",
  "conflict": "",
  "scoring": "score \"whole milk until 2 (instructor)\"; limit amount (iron-deficiency)"
 },
 {
  "id": "D24",
  "topic": "Rubella precautions",
  "sources": "Ch32 airborne; ATI droplet",
  "conflict": "conflict",
  "scoring": "not scored"
 },
 {
  "id": "D25",
  "topic": "Shunt positioning",
  "sources": "Ch32 nonoperative side; lecture flat & midline; review: follow surgeon; PPT flat initially",
  "conflict": "",
  "scoring": "score \"follow surgeon; don't pump reservoir\""
 },
 {
  "id": "D26",
  "topic": "Umbilical hernia closure",
  "sources": "Ch32 1–2 y; PPT 3–5 y",
  "conflict": "",
  "scoring": "score \"most close spontaneously; no coins/binding\""
 },
 {
  "id": "D27",
  "topic": "Hirschsprung dx",
  "sources": "Ch32 barium enema; ATI rectal biopsy (definitive)",
  "conflict": "",
  "scoring": "score rectal biopsy = definitive only with ATI label"
 },
 {
  "id": "D28",
  "topic": "Meconium timing",
  "sources": "Ch32 24–36 h; ATI 24–48 h",
  "conflict": "",
  "scoring": "score \"failure to pass meconium in first 24–48 h = red flag\""
 },
 {
  "id": "D29",
  "topic": "Car seat",
  "sources": "Ch30 internal: rear-facing until 2 y vs birth–20 lb; lecture: CA law rear-facing until 2; PPT booster until 4'9\" & 8–12 y; back seat until 12 (Ch30, ATI) vs PPT \"back seat for children\"",
  "conflict": "",
  "scoring": "score rear-facing ≥2 y, booster to 4'9\", back seat <13"
 },
 {
  "id": "D30",
  "topic": "Unit errors",
  "sources": "Ch31 LP pressure \"mm Hg\"(mm H2O); Ch31 \"plain water is hypertonic\" (hypotonic); Ch32 lead \">10 mg/dL\" (µg/dL)",
  "conflict": "typos",
  "scoring": "not scored at those numbers"
 },
 {
  "id": "D31",
  "topic": "Throat exam",
  "sources": "Ch32 croup section \"never examine throat in LTB\"; lecture/PPT/review: epiglottitis",
  "conflict": "",
  "scoring": "score \"never inspect throat in suspected EPIGLOTTITIS\""
 },
 {
  "id": "D32",
  "topic": "Tonsillectomy fluids",
  "sources": "Ch32: avoid red/brown; one place grape juice acceptable at discharge",
  "conflict": "internal",
  "scoring": "score \"avoid red/brown; no straws; frequent swallowing = bleeding\""
 },
 {
  "id": "D33",
  "topic": "TB visitors mask",
  "sources": "lecture: surgical mask; ATI: N95 for staff & visitors",
  "conflict": "",
  "scoring": "score airborne room + N95 for staff"
 },
 {
  "id": "D34",
  "topic": "Sickle cell supplements",
  "sources": "lecture B12 \"appeared on exit\"; PPT: no routine iron",
  "conflict": "",
  "scoring": "app CONFLICT #50 — score: avoid meperidine, hydrate, O2/pain; not B12"
 },
 {
  "id": "D35",
  "topic": "Leading cause of death",
  "sources": "PPT: MVAs; Ch30: FB aspiration <1 y; lecture: accidents/injuries",
  "conflict": "age-dependent",
  "scoring": "score \"unintentional injury\" only"
 },
 {
  "id": "D36",
  "topic": "Meningitis isolation",
  "sources": "lecture droplet; PPT isolation until 24 h of antibiotics",
  "conflict": "compatible",
  "scoring": "safe"
 },
 {
  "id": "D37",
  "topic": "Practice Q1 (4-y cognitive, user-provided)",
  "sources": "B ambiguous with C",
  "conflict": "",
  "scoring": "practice-only"
 },
 {
  "id": "D38",
  "topic": "Practice Q2 (12-y activities)",
  "sources": "adolescent list supports A,B,C,E; D role-play = preschool; age 12 boundary (school-age 6–12 / adolescent 12–20)",
  "conflict": "",
  "scoring": "source-derived; note boundary"
 },
 {
  "id": "D39",
  "topic": "Suicide rank",
  "sources": "Ch32 cognitive: 3rd leading cause 5–14 y",
  "conflict": "single source",
  "scoring": "safe as \"Ch32 says\""
 },
 {
  "id": "D40",
  "topic": "Piaget stage ages",
  "sources": "Course PowerPoint: sensorimotor 0–2 y. ATI groups preoperational with preschool (3–6), concrete operations with school-age (6–12, ATI Ch6), abstract thought with adolescence (12–20). Your request used standard Piaget ranges 2–7, 7–11, 11–12+.",
  "conflict": "Boundaries differ at 6–7 and 11–12",
  "scoring": "Piaget questions are keyed on behavior, not boundary ages; ages 6–7 and 11–12 are taught as transitions"
 }
];
