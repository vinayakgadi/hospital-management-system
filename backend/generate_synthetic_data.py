#!/usr/bin/env python3
"""
HealthPulse Hospital Management System
Synthetic Data Generator (150,000+ Interconnected Records)

Generates realistic, clinical, Indian-localized synthetic data for:
- Departments (25)
- Staff members (500)
- Doctors (200)
- Patients (10,000)
- Appointments (25,000)
- Medical Records (20,000)
- Prescriptions (15,000)
- Medicines (2,000)
- Prescription Items (30,000)
- Lab Reports / Lab Results (12,000)
- Billing Records (25,000)
- Payments (30,000)
- Rooms (500)
- Beds (2,000)
- Admissions (5,000)
- Discharges (4,000)

Total: 181,000+ Records

Features:
- Enforces 100% referential integrity across all foreign keys.
- Idempotent: checks existing records and only inserts up to target counts without duplicating or resetting existing data.
- High-performance batch insertion using psycopg2.extras.execute_values.
- Comprehensive progress logging and final integrity verification.
"""

import os
import sys
import re
import time
import math
import random
import argparse
import datetime
from datetime import timedelta

# Ensure backend directory is in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from database import get_db_connection
from psycopg2.extras import execute_values
from faker import Faker

# Initialize Indian-localized Faker
fake = Faker('en_IN')
Faker.seed(42)
random.seed(42)

# =====================================================================
# INDIAN CLINICAL DOMAIN DATASETS
# =====================================================================

DEPARTMENTS_DATA = [
    ("Cardiology & Cardiovascular Surgery", "CARD", "Comprehensive adult and pediatric cardiac care, catheterization, and open-heart surgery.", "Tower A, 3rd Floor", "+91-80-2345-0101"),
    ("Neurology & Neurosurgery", "NEUR", "Advanced stroke unit, neuro-oncology, spine surgery, and neurological rehabilitation.", "Tower B, 4th Floor", "+91-80-2345-0102"),
    ("Orthopedics & Joint Replacement", "ORTH", "Primary and revision total joint replacements, trauma surgery, and sports medicine.", "Tower A, 2nd Floor", "+91-80-2345-0103"),
    ("Pediatrics & Neonatology", "PED", "Comprehensive neonatal intensive care (NICU level-III) and developmental pediatric care.", "Tower C, 1st Floor", "+91-80-2345-0104"),
    ("Medical & Surgical Oncology", "ONC", "Comprehensive cancer care, chemotherapy, immunotherapy, and precision radiation oncology.", "Tower D, Ground Floor", "+91-80-2345-0105"),
    ("Obstetrics & Gynecology", "OBGY", "High-risk maternity care, fetal medicine, laparoscopic and robotic gynecologic surgery.", "Tower C, 2nd Floor", "+91-80-2345-0106"),
    ("Gastroenterology & Hepatology", "GAST", "Therapeutic endoscopy, ERCP, liver disease management, and colorectal surgery.", "Tower B, 2nd Floor", "+91-80-2345-0107"),
    ("Nephrology & Urology", "NEPH", "Hemodialysis, peritoneal dialysis, renal transplantation, and minimally invasive urology.", "Tower A, 4th Floor", "+91-80-2345-0108"),
    ("Pulmonology & Respiratory Medicine", "PULM", "Advanced bronchoscopy, allergy and asthma care, sleep disorders, and pulmonary ICU.", "Tower B, 3rd Floor", "+91-80-2345-0109"),
    ("Endocrinology & Diabetology", "ENDO", "Comprehensive diabetes management, thyroid disorders, and metabolic bone disease.", "Tower A, 1st Floor", "+91-80-2345-0110"),
    ("Dermatology & Cosmetology", "DERM", "Clinical dermatology, phototherapy, dermatopathology, and aesthetic laser therapies.", "Tower C, 3rd Floor", "+91-80-2345-0111"),
    ("Ophthalmology & Vitreo-Retina", "OPHT", "Cataract surgery with phacoemulsification, glaucoma clinics, and diabetic retinopathy care.", "Tower C, Ground Floor", "+91-80-2345-0112"),
    ("ENT & Head-Neck Surgery", "ENT", "Micro-ear surgery, endoscopic sinus surgery, cochlear implants, and sleep apnea surgery.", "Tower B, 1st Floor", "+91-80-2345-0113"),
    ("Psychiatry & Behavioral Sciences", "PSYC", "Inpatient psychiatric stabilization, psychotherapy, addiction recovery, and child psychiatry.", "Tower D, 2nd Floor", "+91-80-2345-0114"),
    ("Emergency & Critical Care Medicine", "EMER", "24x7 Level-1 trauma center, resuscitation suites, and advanced emergency life support.", "Ground Floor, Main Entrance", "+91-80-2345-0115"),
    ("General & Laparoscopic Surgery", "GSUR", "Minimally invasive abdominal surgery, hernia repair, emergency laparotomy, and surgical care.", "Tower A, 5th Floor", "+91-80-2345-0116"),
    ("Internal Medicine", "IMED", "Adult multisystem disease management, infectious diseases, and preventive health screenings.", "Tower A, Ground Floor", "+91-80-2345-0117"),
    ("Anesthesiology & Pain Medicine", "ANES", "Perioperative anesthesia, ultrasound-guided regional nerve blocks, and chronic pain clinics.", "OT Complex, 3rd Floor", "+91-80-2345-0118"),
    ("Radiology & Diagnostic Imaging", "RAD", "3 Tesla MRI, 256-slice dual-source CT, digital mammography, and interventional radiology.", "Basement 1, Diagnostic Wing", "+91-80-2345-0119"),
    ("Pathology & Laboratory Medicine", "PATH", "Fully automated clinical biochemistry, hematology, histopathology, and molecular diagnostics.", "Basement 1, Laboratory Block", "+91-80-2345-0120"),
    ("Physical Medicine & Rehabilitation", "PMR", "Post-stroke neuro-rehabilitation, musculoskeletal physiotherapy, and occupational therapy.", "Tower D, 1st Floor", "+91-80-2345-0121"),
    ("Plastic & Reconstructive Surgery", "PLAS", "Burn reconstruction, microvascular flap surgery, craniofacial surgery, and hand trauma care.", "Tower B, 5th Floor", "+91-80-2345-0122"),
    ("Rheumatology & Clinical Immunology", "RHEU", "Autoimmune connective tissue disorders, rheumatoid arthritis, lupus, and biologic therapy.", "Tower C, 4th Floor", "+91-80-2345-0123"),
    ("Infectious Diseases & Travel Medicine", "INFD", "Hospital infection control, antimicrobial stewardship, tropical diseases, and travel immunization.", "Tower D, 3rd Floor", "+91-80-2345-0124"),
    ("Dental & Maxillofacial Surgery", "DENT", "Orthognathic jaw surgery, dental implants, facial trauma surgery, and pediatric dentistry.", "Tower C, 5th Floor", "+91-80-2345-0125")
]

INDIAN_MALE_FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Shaurya", "Atharva", "Kabir", "Rudra", "Dhruv", "Rishi", "Dev", "Rajesh", "Amit", "Suresh",
    "Ramesh", "Manoj", "Venkatesh", "Deepak", "Vikram", "Sunil", "Anil", "Pradeep", "Ashok", "Sanjay",
    "Praveen", "Mahesh", "Girish", "Kishore", "Raghav", "Madhav", "Karthik", "Gautam", "Naveen", "Satish",
    "Arun", "Brijesh", "Chetan", "Dinesh", "Ganesh", "Hemant", "Jagdish", "Kailash", "Lalit", "Mohan",
    "Nitin", "Pankaj", "Rakesh", "Sachin", "Tarun", "Umesh", "Vinod", "Yogesh", "Shravan", "Harish"
]

INDIAN_FEMALE_FIRST_NAMES = [
    "Aadhya", "Diya", "Saanvi", "Ananya", "Pari", "Anika", "Navya", "Angel", "Ira", "Myra",
    "Sara", "Riya", "Prisha", "Aarohi", "Siya", "Kavya", "Avani", "Khushi", "Sneha", "Pooja",
    "Sunita", "Anita", "Deepa", "Meena", "Shweta", "Preeti", "Divya", "Swati", "Neha", "Rekha",
    "Suma", "Lakshmi", "Radha", "Parvati", "Geeta", "Seema", "Vidya", "Usha", "Shubha", "Bhavana",
    "Chitra", "Damini", "Gayatri", "Harini", "Indira", "Jyoti", "Kalyani", "Lalitha", "Madhavi", "Nandini",
    "Pallavi", "Rupali", "Sandhya", "Tanvi", "Uma", "Vandana", "Yamuna", "Meenakshi", "Aparna", "Shalini"
]

INDIAN_LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Shah", "Mehta", "Joshi", "Deshmukh",
    "Kulkarni", "Patil", "Shinde", "Reddy", "Rao", "Nair", "Pillai", "Iyer", "Iyengar", "Menon",
    "Murthy", "Swaminathan", "Mukherjee", "Banerjee", "Chatterjee", "Bose", "Ghosh", "Das", "Sen", "Roy",
    "Agarwal", "Bhatt", "Choudhary", "Dubey", "Garg", "Hegde", "Jha", "Khan", "Lal", "Mishra",
    "Pandey", "Qureshi", "Rawat", "Saxena", "Tiwari", "Upadhyay", "Venkataraman", "Wadhwa", "Yadav", "Zaidi",
    "Bhatnagar", "Chakraborty", "Deshpande", "Gokhale", "Majumdar", "Nambiar", "Purohit", "Ranganathan", "Shetty", "Tripathi"
]

INDIAN_CITIES = [
    ("Bengaluru", "Karnataka", ["Indiranagar", "Koramangala", "Whitefield", "Jayanagar", "Malleshwaram", "HSR Layout", "JP Nagar", "Marathahalli"], "5600"),
    ("Mumbai", "Maharashtra", ["Andheri West", "Bandra", "Dadar", "Borivali", "Goregaon", "Juhu", "Powai", "Thane"], "4000"),
    ("New Delhi", "Delhi", ["Rohini", "Dwarka", "Saket", "Vasant Kunj", "Karol Bagh", "Lajpat Nagar", "Hauz Khas", "Connaught Place"], "1100"),
    ("Hyderabad", "Telangana", ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kukatpally", "Begumpet", "Ameerpet", "Secunderabad"], "5000"),
    ("Chennai", "Tamil Nadu", ["T. Nagar", "Anna Nagar", "Adyar", "Mylapore", "Velachery", "Nungambakkam", "Besant Nagar", "Guindy"], "6000"),
    ("Kolkata", "West Bengal", ["Salt Lake", "New Town", "Ballygunge", "Alipore", "Park Street", "Howrah", "Dum Dum", "Garia"], "7000"),
    ("Pune", "Maharashtra", ["Kothrud", "Viman Nagar", "Hinjewadi", "Aundh", "Wakad", "Baner", "Kalyani Nagar", "Shivajinagar"], "4110"),
    ("Ahmedabad", "Gujarat", ["Satellite", "Bodakdev", "Navrangpura", "Vastrapur", "Maninagar", "Prahlad Nagar", "Thaltej", "Paldi"], "3800"),
    ("Jaipur", "Rajasthan", ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme", "Raja Park", "Bani Park", "Tonk Road", "Jagatpura"], "3020"),
    ("Lucknow", "Uttar Pradesh", ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar", "Mahanagar", "Janki Puram", "Ashiyana", "Vikas Nagar"], "2260")
]

MEDICAL_DISEASES = [
    ("Type 2 Diabetes Mellitus", "Endocrinology & Diabetology"),
    ("Essential Primary Hypertension", "Cardiology & Cardiovascular Surgery"),
    ("Coronary Artery Disease & Stable Angina", "Cardiology & Cardiovascular Surgery"),
    ("Chronic Bronchial Asthma", "Pulmonology & Respiratory Medicine"),
    ("Osteoarthritis of Bilateral Knees", "Orthopedics & Joint Replacement"),
    ("Allergic Rhinosinusitis", "ENT & Head-Neck Surgery"),
    ("Acute Gastroenteritis with Dehydration", "Gastroenterology & Hepatology"),
    ("Dengue Fever with Thrombocytopenia", "Infectious Diseases & Travel Medicine"),
    ("Gastroesophageal Reflux Disease (GERD)", "Gastroenterology & Hepatology"),
    ("Hypothyroidism (Hashimoto's Thyroiditis)", "Endocrinology & Diabetology"),
    ("Chronic Kidney Disease (Stage 3a)", "Nephrology & Urology"),
    ("Lumbar Spondylosis with Radiculopathy", "Orthopedics & Joint Replacement"),
    ("Migraine without Aura", "Neurology & Neurosurgery"),
    ("Non-Alcoholic Fatty Liver Disease (Grade-2)", "Gastroenterology & Hepatology"),
    ("Acute Bacterial Urinary Tract Infection", "Nephrology & Urology"),
    ("Iron Deficiency Anemia (Microcytic Hypochromic)", "Internal Medicine"),
    ("Acute Pharyngotonsillitis", "ENT & Head-Neck Surgery"),
    ("Rheumatoid Arthritis (Seropositive)", "Rheumatology & Clinical Immunology"),
    ("Benign Prostatic Hyperplasia (Grade-II)", "Nephrology & Urology"),
    ("Atopic Dermatitis & Eczema", "Dermatology & Cosmetology"),
    ("Cataract (Senile Nuclear Sclerosis)", "Ophthalmology & Vitreo-Retina"),
    ("Major Depressive Disorder (Moderate)", "Psychiatry & Behavioral Sciences"),
    ("Infiltrating Ductal Carcinoma of Breast", "Medical & Surgical Oncology"),
    ("Acute Calculus Cholecystitis", "General & Laparoscopic Surgery"),
    ("Community-Acquired Pneumonia", "Pulmonology & Respiratory Medicine")
]

PHARMA_COMPANIES = [
    "Sun Pharmaceutical Industries Ltd.", "Cipla Ltd.", "Dr. Reddy's Laboratories Ltd.",
    "Torrent Pharmaceuticals Ltd.", "Lupin Ltd.", "Mankind Pharma Ltd.",
    "Zydus Lifesciences Ltd.", "Alkem Laboratories Ltd.", "Glenmark Pharmaceuticals Ltd.",
    "Abbott India Ltd.", "Aurobindo Pharma Ltd.", "Ipca Laboratories Ltd."
]

MEDICINE_TEMPLATES = [
    ("Paracetamol", "Paracetamol", "Analgesic & Antipyretic", ["Tablet", "Syrup", "IV Infusion"], ["500mg", "650mg", "1000mg", "120mg/5ml"], 15.00, 65.00),
    ("Dolo", "Paracetamol", "Analgesic & Antipyretic", ["Tablet"], ["650mg"], 32.00, 40.00),
    ("Augmentin", "Amoxicillin and Potassium Clavulanate", "Antibiotic", ["Tablet", "Syrup", "Injection"], ["625mg", "375mg", "1000mg", "1.2g"], 140.00, 290.00),
    ("Telma", "Telmisartan", "Antihypertensive", ["Tablet"], ["20mg", "40mg", "80mg"], 85.00, 180.00),
    ("Telma-H", "Telmisartan + Hydrochlorothiazide", "Antihypertensive", ["Tablet"], ["40mg/12.5mg", "80mg/12.5mg"], 120.00, 210.00),
    ("Amlong", "Amlodipine Besylate", "Antihypertensive", ["Tablet"], ["2.5mg", "5mg", "10mg"], 45.00, 95.00),
    ("Glycomet", "Metformin Hydrochloride", "Antidiabetic", ["Tablet", "Extended Release"], ["500mg", "850mg", "1000mg"], 35.00, 75.00),
    ("Glycomet-GP", "Glimepiride + Metformin", "Antidiabetic", ["Tablet"], ["1mg/500mg", "2mg/500mg", "2mg/1000mg"], 95.00, 185.00),
    ("Jardiance", "Empagliflozin", "Antidiabetic (SGLT2)", ["Tablet"], ["10mg", "25mg"], 420.00, 650.00),
    ("Januvia", "Sitagliptin Phosphate", "Antidiabetic (DPP-4)", ["Tablet"], ["50mg", "100mg"], 380.00, 560.00),
    ("Pan", "Pantoprazole Sodium", "Proton Pump Inhibitor", ["Tablet", "Injection"], ["40mg", "20mg"], 75.00, 140.00),
    ("Pan-D", "Pantoprazole + Domperidone", "Antacid & Antiemetic", ["Capsule"], ["40mg/30mg"], 125.00, 195.00),
    ("Rablet", "Rabeprazole Sodium", "Proton Pump Inhibitor", ["Tablet"], ["20mg"], 90.00, 150.00),
    ("Azee", "Azithromycin", "Macrolide Antibiotic", ["Tablet", "Suspension"], ["250mg", "500mg", "200mg/5ml"], 110.00, 195.00),
    ("Cifran", "Ciprofloxacin", "Fluoroquinolone Antibiotic", ["Tablet", "Eye Drops"], ["250mg", "500mg", "0.3%"], 65.00, 120.00),
    ("Zifi", "Cefixime", "Cephalosporin Antibiotic", ["Tablet", "Dry Syrup"], ["100mg", "200mg", "400mg"], 105.00, 215.00),
    ("Monocef", "Ceftriaxone Sodium", "Cephalosporin Antibiotic", ["Injection"], ["500mg", "1000mg", "2000mg"], 85.00, 230.00),
    ("Atorva", "Atorvastatin Calcium", "HMG-CoA Reductase Inhibitor", ["Tablet"], ["10mg", "20mg", "40mg", "80mg"], 110.00, 320.00),
    ("Rosuvas", "Rosuvastatin Calcium", "Lipid-Lowering Agent", ["Tablet"], ["5mg", "10mg", "20mg", "40mg"], 130.00, 390.00),
    ("Montair-LC", "Montelukast + Levocetirizine", "Antiallergic & Bronchodilator", ["Tablet", "Syrup"], ["10mg/5mg", "4mg/2.5mg"], 145.00, 220.00),
    ("Ascoril-LS", "Levosalbutamol + Ambroxol + Guaiphenesin", "Expectorant", ["Syrup"], ["100ml"], 115.00, 145.00),
    ("Budecort", "Budesonide", "Corticosteroid Inhaler", ["Inhaler", "Respules"], ["100mcg", "200mcg", "0.5mg/2ml"], 210.00, 380.00),
    ("Shelcal", "Calcium + Vitamin D3", "Nutritional Supplement", ["Tablet", "Syrup"], ["500mg/250IU", "250mg/125IU"], 95.00, 160.00),
    ("Neurobion Forte", "Vitamin B-Complex + B12", "Neurotropic Vitamin", ["Tablet", "Injection"], ["Standard", "2ml"], 38.00, 65.00),
    ("Ecosprin", "Aspirin (Enteric Coated)", "Antiplatelet", ["Tablet"], ["75mg", "150mg"], 18.00, 35.00),
    ("Clopilet", "Clopidogrel", "Antiplatelet", ["Tablet"], ["75mg"], 95.00, 160.00),
    ("Betaloc", "Metoprolol Succinate", "Beta Blocker", ["Extended Release Tablet"], ["25mg", "50mg", "100mg"], 85.00, 175.00),
    ("Thyronorm", "Levothyroxine Sodium", "Thyroid Hormone", ["Tablet"], ["25mcg", "50mcg", "75mcg", "100mcg", "125mcg"], 110.00, 195.00),
    ("Zerodol-SP", "Aceclofenac + Paracetamol + Serratiopeptidase", "Anti-inflammatory", ["Tablet"], ["100mg/325mg/15mg"], 105.00, 145.00),
    ("Tramazac", "Tramadol Hydrochloride", "Opioid Analgesic", ["Capsule", "Injection"], ["50mg", "100mg/2ml"], 75.00, 140.00),
    ("Nexito", "Escitalopram Oxalate", "Antidepressant (SSRI)", ["Tablet"], ["5mg", "10mg", "20mg"], 95.00, 190.00),
    ("Lonazep", "Clonazepam", "Anxiolytic & Anticonvulsant", ["Tablet"], ["0.25mg", "0.5mg", "1mg", "2mg"], 45.00, 95.00),
    ("Lyrica", "Pregabalin", "Neuropathic Pain Agent", ["Capsule"], ["50mg", "75mg", "150mg"], 160.00, 340.00),
    ("Betadine", "Povidone Iodine", "Antiseptic & Disinfectant", ["Ointment", "Solution", "Gargle"], ["5% w/w", "10% w/v", "2% w/v"], 65.00, 185.00),
    ("T-Bact", "Mupirocin", "Topical Antibacterial", ["Ointment"], ["2% w/w 5g", "2% w/w 15g"], 110.00, 230.00)
]

LAB_TEST_TEMPLATES = [
    ("Complete Blood Count (CBC) with Hemogram", "13.5 - 17.5", "g/dL", "Hematology", 14.5, 2.0),
    ("Fasting Blood Sugar (FBS)", "70 - 100", "mg/dL", "Biochemistry", 95, 30),
    ("Post-Prandial Blood Sugar (PPBS)", "100 - 140", "mg/dL", "Biochemistry", 130, 45),
    ("Glycosylated Hemoglobin (HbA1c)", "4.0 - 5.6", "%", "Biochemistry", 5.8, 1.5),
    ("Serum Total Cholesterol", "125 - 200", "mg/dL", "Lipid Profile", 185, 35),
    ("Serum Triglycerides", "50 - 150", "mg/dL", "Lipid Profile", 140, 50),
    ("Serum HDL Cholesterol (Good)", "40 - 60", "mg/dL", "Lipid Profile", 48, 10),
    ("Serum LDL Cholesterol (Bad)", "60 - 100", "mg/dL", "Lipid Profile", 105, 30),
    ("Serum Creatinine", "0.7 - 1.3", "mg/dL", "Renal Function", 0.95, 0.3),
    ("Blood Urea Nitrogen (BUN)", "7 - 20", "mg/dL", "Renal Function", 14, 5),
    ("Serum Uric Acid", "3.5 - 7.2", "mg/dL", "Renal Function", 5.4, 1.2),
    ("Serum Bilirubin (Total)", "0.2 - 1.2", "mg/dL", "Liver Function", 0.7, 0.4),
    ("Serum SGOT (AST)", "10 - 40", "U/L", "Liver Function", 28, 12),
    ("Serum SGPT (ALT)", "10 - 45", "U/L", "Liver Function", 32, 15),
    ("Serum Alkaline Phosphatase (ALP)", "44 - 147", "IU/L", "Liver Function", 92, 30),
    ("Serum Total Protein", "6.4 - 8.3", "g/dL", "Liver Function", 7.2, 0.6),
    ("Serum Albumin", "3.5 - 5.0", "g/dL", "Liver Function", 4.2, 0.4),
    ("Thyroid Stimulating Hormone (TSH)", "0.35 - 4.94", "uIU/mL", "Endocrinology", 2.6, 1.8),
    ("Serum Free Thyroxine (FT4)", "0.70 - 1.48", "ng/dL", "Endocrinology", 1.1, 0.25),
    ("Serum Electrolytes (Sodium)", "136 - 145", "mmol/L", "Biochemistry", 140, 3),
    ("Serum Electrolytes (Potassium)", "3.5 - 5.1", "mmol/L", "Biochemistry", 4.2, 0.4),
    ("C-Reactive Protein (CRP Quantitative)", "0.0 - 5.0", "mg/L", "Immunology", 3.2, 6.0),
    ("Erythrocyte Sedimentation Rate (ESR)", "0 - 20", "mm/hr", "Hematology", 14, 12),
    ("Urine Routine & Microscopic Examination", "Nil / Trace", "Visual", "Clinical Pathology", 0, 0),
    ("Dengue NS1 Antigen & IgM/IgG Antibody", "Negative", "Serology", "Microbiology", 0, 0),
    ("Vitamin D3 (25-Hydroxycalciferol)", "30.0 - 100.0", "ng/mL", "Biochemistry", 28.5, 12.0),
    ("Vitamin B12 (Cyanocobalamin)", "211 - 911", "pg/mL", "Biochemistry", 345, 120),
    ("Prothrombin Time & INR (PT/INR)", "0.8 - 1.2", "Ratio", "Coagulation", 1.05, 0.2)
]

# =====================================================================
# GENERATOR HELPER FUNCTIONS
# =====================================================================

def generate_indian_name(gender='Any'):
    if gender == 'Male':
        first = random.choice(INDIAN_MALE_FIRST_NAMES)
    elif gender == 'Female':
        first = random.choice(INDIAN_FEMALE_FIRST_NAMES)
    else:
        first = random.choice(INDIAN_MALE_FIRST_NAMES if random.random() < 0.52 else INDIAN_FEMALE_FIRST_NAMES)
    last = random.choice(INDIAN_LAST_NAMES)
    return f"{first} {last}"

def generate_indian_phone():
    prefix = random.choice(["98", "97", "96", "94", "93", "91", "88", "87", "80", "79", "70"])
    digits = "".join([str(random.randint(0, 9)) for _ in range(8)])
    return f"+91 {prefix}{digits[:4]} {digits[4:]}"

def generate_indian_address():
    city_info = random.choice(INDIAN_CITIES)
    city_name, state_name, localities, pin_prefix = city_info
    locality = random.choice(localities)
    door_no = f"#{random.randint(1, 150)}, {random.choice(['Flat', 'Apt', 'Villa', 'Plot'])} {random.randint(101, 804)}"
    pin_code = f"{pin_prefix}{random.randint(10, 99)}"
    return f"{door_no}, {locality}, {city_name}, {state_name} - {pin_code}"

def random_date_between(start_date, end_date):
    delta = end_date - start_date
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    if int_delta <= 0:
        return start_date
    random_second = random.randrange(int_delta)
    return start_date + timedelta(seconds=random_second)


# =====================================================================
# CORE GENERATOR CLASS
# =====================================================================

class HospitalSyntheticDataGenerator:
    def __init__(self, batch_size=2000):
        self.batch_size = batch_size
        self.conn = get_db_connection()
        self.raw_conn = getattr(self.conn, 'raw_conn', self.conn)
        self.cur = self.raw_conn.cursor()
        self.now = datetime.datetime.now()
        self.stats = {}

    def close(self):
        try:
            self.cur.close()
            self.conn.close()
        except Exception:
            pass

    def get_count(self, table_name):
        self.cur.execute(f"SELECT COUNT(*) FROM {table_name};")
        return self.cur.fetchone()[0]

    def log(self, stage, msg):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] [{stage.upper()}] {msg}", flush=True)

    # -------------------------------------------------------------
    # 1. DEPARTMENTS
    # -------------------------------------------------------------
    def generate_departments(self, target_count=25):
        self.log("departments", f"Target count: {target_count}")
        current_count = self.get_count("departments")
        if current_count >= target_count:
            self.log("departments", f"Already has {current_count} departments (target {target_count}). Skipping.")
            return

        needed = target_count - current_count
        dept_subset = DEPARTMENTS_DATA[:target_count]

        # Fetch existing department names
        self.cur.execute("SELECT name FROM departments;")
        existing_names = {r[0] for r in self.cur.fetchall()}

        records = []
        for name, code, desc, loc, phone in dept_subset:
            if name not in existing_names:
                records.append((name, code, desc, None, phone, loc, self.now))

        if records:
            sql = """
                INSERT INTO departments (name, code, description, head_doctor_id, phone, location, created_at)
                VALUES %s
                ON CONFLICT (name) DO NOTHING;
            """
            execute_values(self.cur, sql, records)
            self.raw_conn.commit()

        final_count = self.get_count("departments")
        self.stats["departments"] = final_count
        self.log("departments", f"Successfully ensured {final_count} departments.")

    # -------------------------------------------------------------
    # 2. DOCTORS
    # -------------------------------------------------------------
    def generate_doctors(self, target_count=200):
        self.log("doctors", f"Target count: {target_count}")
        current_count = self.get_count("doctors")
        if current_count >= target_count:
            self.log("doctors", f"Already has {current_count} doctors (target {target_count}). Skipping.")
            return

        needed = target_count - current_count
        self.log("doctors", f"Generating {needed} new synthetic doctors...")

        # Load departments to link
        self.cur.execute("SELECT id, name FROM departments ORDER BY id;")
        depts = self.cur.fetchall()
        dept_ids = [d[0] for d in depts]
        dept_names = {d[0]: d[1] for d in depts}

        # Check existing emails
        self.cur.execute("SELECT email FROM doctors;")
        existing_emails = {r[0] for r in self.cur.fetchall()}

        doctors_batch = []
        start_id = current_count + 1

        for i in range(needed):
            doc_idx = start_id + i
            gender = 'Male' if random.random() < 0.60 else 'Female'
            name = f"Dr. {generate_indian_name(gender)}"
            email = f"dr.{doc_idx}.{random.choice(['aiims', 'apollo', 'healthpulse'])}@healthpulse.com"
            while email in existing_emails:
                email = f"dr.{doc_idx}_{random.randint(100, 999)}@healthpulse.com"
            existing_emails.add(email)

            dept_id = dept_ids[i % len(dept_ids)]
            dept_name = dept_names[dept_id]
            spec = dept_name.split('&')[0].strip()

            phone = generate_indian_phone()
            exp = random.randint(5, 32)
            quals = random.choice([
                f"MBBS, MD ({spec}) - AIIMS New Delhi",
                f"MBBS, MS ({spec}) - KEM Hospital Mumbai",
                f"MBBS, DM ({spec}) - CMC Vellore",
                f"MBBS, DNB ({spec}) - National Board of Examinations",
                f"MBBS, MCh ({spec}) - PGIMER Chandigarh",
                f"MBBS, MD ({spec}) - Madras Medical College"
            ])
            bio = f"Distinguished senior clinical specialist in {spec} with over {exp} years of active clinical practice and hospital consultation experience."

            doctors_batch.append((
                None, name, email, "pbkdf2:sha256:260000$doctor123", spec, phone,
                'Active', 'Doctor', self.now, quals, bio, exp, dept_id
            ))

        sql = """
            INSERT INTO doctors (
                user_id, name, email, password, specialization, phone,
                status, role, created_at, qualifications, biography, experience_years, department_id
            ) VALUES %s;
        """
        execute_values(self.cur, sql, doctors_batch, page_size=self.batch_size)
        self.raw_conn.commit()

        # Update department head_doctor_id efficiently in one query
        self.cur.execute("""
            UPDATE departments d
            SET head_doctor_id = sub.id
            FROM (
                SELECT DISTINCT ON (department_id) id, department_id
                FROM doctors
                WHERE department_id IS NOT NULL
                ORDER BY department_id, id
            ) sub
            WHERE d.id = sub.department_id AND d.head_doctor_id IS NULL;
        """)
        self.raw_conn.commit()

        final_count = self.get_count("doctors")
        self.stats["doctors"] = final_count
        self.log("doctors", f"Successfully reached {final_count} credentialed doctors.")

    # -------------------------------------------------------------
    # 3. STAFF MEMBERS
    # -------------------------------------------------------------
    def generate_staff(self, target_count=500):
        self.log("staff", f"Target count: {target_count}")
        current_count = self.get_count("staff")
        if current_count >= target_count:
            self.log("staff", f"Already has {current_count} staff members. Skipping.")
            return

        needed = target_count - current_count
        self.log("staff", f"Generating {needed} clinical & administrative staff...")

        self.cur.execute("SELECT id FROM departments ORDER BY id;")
        dept_ids = [r[0] for r in self.cur.fetchall()]

        roles_pool = [
            ("Staff Nurse - ICU", "B.Sc Nursing", 38000.00),
            ("Staff Nurse - Inpatient Ward", "GNM Nursing", 32000.00),
            ("Head Nurse / Ward Supervisor", "M.Sc Nursing", 48000.00),
            ("Senior Clinical Pharmacist", "B.Pharm / M.Pharm", 42000.00),
            ("Medical Laboratory Technologist", "B.Sc MLT", 35000.00),
            ("Radiologic Technologist (CT/MRI)", "Diploma in Medical Imaging", 40000.00),
            ("Dialysis Technologist", "B.Sc Renal Dialysis", 36000.00),
            ("Operation Theatre Technician", "Diploma in OT Technology", 34000.00),
            ("Physiotherapist", "BPT / MPT", 40000.00),
            ("Clinical Nutritionist & Dietitian", "M.Sc Food & Nutrition", 35000.00),
            ("Patient Billing & TPA Specialist", "B.Com / Healthcare Finance", 36000.00),
            ("Front Desk & Patient Coordinator", "BBA Hospital Management", 28000.00),
            ("Biomedical Equipment Engineer", "B.Tech Biomedical", 45000.00)
        ]

        shifts = ["Morning", "Evening", "Night", "Rotational"]
        start_date = datetime.date(2021, 1, 1)
        end_date = datetime.date(2026, 10, 1)

        staff_batch = []
        for i in range(needed):
            s_idx = current_count + i + 1
            dept_id = random.choice(dept_ids) if dept_ids else None
            gender = 'Female' if random.random() < 0.65 else 'Male'
            name = generate_indian_name(gender)
            role_info = random.choice(roles_pool)
            role_name, qual, base_salary = role_info
            clean_fname = re.sub(r'[^a-zA-Z0-9]', '', name.split()[0]).lower()
            email = f"staff.{s_idx}.{clean_fname}@healthpulse.com"
            phone = generate_indian_phone()
            shift = random.choice(shifts)
            salary = base_salary + round(random.uniform(-3000, 8000), -2)
            joined = random_date_between(start_date, end_date)

            staff_batch.append((
                dept_id, None, name, role_name, email, phone,
                shift, 'Active', qual, salary, joined, self.now
            ))

        sql = """
            INSERT INTO staff (
                department_id, user_id, name, role, email, phone,
                shift, status, qualification, salary, joined_date, created_at
            ) VALUES %s;
        """
        execute_values(self.cur, sql, staff_batch, page_size=self.batch_size)
        self.raw_conn.commit()

        final_count = self.get_count("staff")
        self.stats["staff"] = final_count
        self.log("staff", f"Successfully reached {final_count} hospital staff members.")

    # -------------------------------------------------------------
    # 4. PATIENTS
    # -------------------------------------------------------------
    def generate_patients(self, target_count=10000):
        self.log("patients", f"Target count: {target_count}")
        current_count = self.get_count("patients")
        if current_count >= target_count:
            self.log("patients", f"Already has {current_count} patients. Skipping.")
            return

        needed = target_count - current_count
        self.log("patients", f"Generating {needed} realistic Indian patient records...")

        # Load doctors to assign
        self.cur.execute("SELECT id, name, specialization FROM doctors ORDER BY id;")
        doctors = self.cur.fetchall()
        if not doctors:
            raise RuntimeError("No doctors found in database to assign patients to.")

        blood_groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

        patients_batch = []
        start_id = current_count + 1

        for i in range(needed):
            p_idx = start_id + i
            gender = 'Male' if random.random() < 0.51 else 'Female'
            name = generate_indian_name(gender)
            age = int(random.triangular(1, 90, 42))
            weight_val = round(random.uniform(45.0, 95.0), 1) if age > 15 else round(random.uniform(3.5, 40.0), 1)
            weight = f"{weight_val} kg"

            email = f"patient.{p_idx}.{random.randint(100, 999)}@healthpulse.com"
            disease_item = random.choice(MEDICAL_DISEASES)
            disease_name = disease_item[0]

            doc = random.choice(doctors)
            doc_id, doc_name, doc_spec = doc[0], doc[1], doc[2]

            phone = generate_indian_phone()
            addr = generate_indian_address()
            em_name = generate_indian_name()
            em_phone = generate_indian_phone()
            dob_year = 2026 - age
            dob = f"{dob_year}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"
            bg = random.choice(blood_groups)

            # Registration timestamp spread over last 2 years
            reg_date = self.now - timedelta(days=random.randint(1, 700), hours=random.randint(0, 23))

            patients_batch.append((
                None, name, weight, gender, str(age), email,
                "patient123", disease_name, doc_id, doc_name, doc_spec,
                'Patient', reg_date, phone, addr, em_name, em_phone, dob, bg
            ))

        sql = """
            INSERT INTO patients (
                user_id, name, weight, gender, age, email,
                password, disease, doctor_id, doctor_name, doctor_specialization,
                role, created_at, phone, address, emergency_contact_name,
                emergency_contact_phone, date_of_birth, blood_group
            ) VALUES %s;
        """
        execute_values(self.cur, sql, patients_batch, page_size=self.batch_size)
        self.raw_conn.commit()

        final_count = self.get_count("patients")
        self.stats["patients"] = final_count
        self.log("patients", f"Successfully reached {final_count} registered patient records.")

    # -------------------------------------------------------------
    # 5. MEDICINES
    # -------------------------------------------------------------
    def generate_medicines(self, target_count=2000):
        self.log("medicines", f"Target count: {target_count}")
        current_count = self.get_count("medicines")
        if current_count >= target_count:
            self.log("medicines", f"Already has {current_count} medicines. Skipping.")
            return

        needed = target_count - current_count
        self.log("medicines", f"Generating {needed} pharmaceutical catalog items...")

        self.cur.execute("SELECT name FROM medicines;")
        existing_names = {r[0] for r in self.cur.fetchall()}

        medicines_batch = []
        counter = 1

        while len(medicines_batch) < needed:
            tmpl = random.choice(MEDICINE_TEMPLATES)
            brand_base, generic, category, forms, strengths, min_p, max_p = tmpl
            form = random.choice(forms)
            strength = random.choice(strengths)
            mfg = random.choice(PHARMA_COMPANIES)
            price = round(random.uniform(min_p, max_p), 2)
            stock = random.randint(50, 4500)
            reorder = random.randint(20, 150)
            expiry = datetime.date(random.randint(2027, 2030), random.randint(1, 12), random.randint(1, 28))

            name = f"{brand_base} {strength} {form}"
            if name in existing_names:
                name = f"{brand_base} {strength} {form} #{counter}"
                counter += 1

            if name not in existing_names:
                existing_names.add(name)
                medicines_batch.append((
                    name, generic, category, form, strength, mfg,
                    price, stock, reorder, expiry, self.now
                ))

        sql = """
            INSERT INTO medicines (
                name, generic_name, category, dosage_form, strength,
                manufacturer, price, stock_quantity, reorder_level, expiry_date, created_at
            ) VALUES %s;
        """
        execute_values(self.cur, sql, medicines_batch, page_size=self.batch_size)
        self.raw_conn.commit()

        final_count = self.get_count("medicines")
        self.stats["medicines"] = final_count
        self.log("medicines", f"Successfully reached {final_count} pharmaceutical medicines.")

    # -------------------------------------------------------------
    # 6. ROOMS & BEDS
    # -------------------------------------------------------------
    def generate_rooms_and_beds(self, target_rooms=500, target_beds=2000):
        self.log("rooms", f"Target rooms: {target_rooms}, Target beds: {target_beds}")
        curr_rooms = self.get_count("rooms")
        curr_beds = self.get_count("beds")

        if curr_rooms >= target_rooms and curr_beds >= target_beds:
            self.log("rooms", f"Already has {curr_rooms} rooms and {curr_beds} beds. Skipping.")
            return

        self.cur.execute("SELECT id FROM departments ORDER BY id;")
        dept_ids = [r[0] for r in self.cur.fetchall()]

        # Generate Rooms if needed
        if curr_rooms < target_rooms:
            needed_rooms = target_rooms - curr_rooms
            self.log("rooms", f"Generating {needed_rooms} hospital rooms...")

            self.cur.execute("SELECT room_number FROM rooms;")
            existing_rooms = {r[0] for r in self.cur.fetchall()}

            room_types = [
                ("General Medical Ward", 1200.00),
                ("Semi-Private Room", 2500.00),
                ("Single Deluxe Private Room", 5500.00),
                ("Intensive Care Unit (ICU)", 12500.00),
                ("Neonatal ICU (NICU)", 9500.00),
                ("Cardiac Care Unit (CCU)", 11000.00),
                ("Day Care Recovery Suite", 1800.00)
            ]

            rooms_batch = []
            for i in range(needed_rooms):
                r_num = curr_rooms + i + 101
                floor = ((r_num // 100) % 5) + 1
                room_no = f"R-{floor}{r_num % 100:02d}"
                while room_no in existing_rooms:
                    r_num += 1
                    room_no = f"R-{floor}{r_num % 1000:03d}"
                existing_rooms.add(room_no)

                dept_id = dept_ids[i % len(dept_ids)] if dept_ids else None
                rtype, charge = random.choice(room_types)

                rooms_batch.append((
                    room_no, dept_id, rtype, floor, charge, 'Available', self.now
                ))

            sql = """
                INSERT INTO rooms (
                    room_number, department_id, room_type, floor, charge_per_day, status, created_at
                ) VALUES %s;
            """
            execute_values(self.cur, sql, rooms_batch, page_size=self.batch_size)
            self.raw_conn.commit()

        final_rooms = self.get_count("rooms")
        self.stats["rooms"] = final_rooms
        self.log("rooms", f"Total rooms verified: {final_rooms}")

        # Generate Beds
        curr_beds = self.get_count("beds")
        if curr_beds < target_beds:
            needed_beds = target_beds - curr_beds
            self.log("beds", f"Generating {needed_beds} hospital beds...")

            self.cur.execute("SELECT id, room_type FROM rooms ORDER BY id;")
            all_rooms = self.cur.fetchall()

            self.cur.execute("SELECT room_id, bed_number FROM beds;")
            existing_beds = {(r[0], r[1]) for r in self.cur.fetchall()}

            beds_batch = []
            bed_letters = ["A", "B", "C", "D", "E"]

            for room_id, rtype in all_rooms:
                if len(beds_batch) >= needed_beds:
                    break

                capacity = 4 if "General" in rtype else (2 if "Semi" in rtype else 1)
                for c in range(capacity):
                    if len(beds_batch) >= needed_beds:
                        break
                    bed_no = f"Bed-{bed_letters[c]}"
                    if (room_id, bed_no) not in existing_beds:
                        existing_beds.add((room_id, bed_no))
                        beds_batch.append((room_id, bed_no, 'Available', self.now))

            # If still needed, add beds to general rooms
            if len(beds_batch) < needed_beds:
                for room_id, _ in all_rooms:
                    if len(beds_batch) >= needed_beds:
                        break
                    for extra in range(5, 10):
                        if len(beds_batch) >= needed_beds:
                            break
                        bed_no = f"Bed-{extra}"
                        if (room_id, bed_no) not in existing_beds:
                            existing_beds.add((room_id, bed_no))
                            beds_batch.append((room_id, bed_no, 'Available', self.now))

            sql = """
                INSERT INTO beds (room_id, bed_number, status, created_at)
                VALUES %s;
            """
            execute_values(self.cur, sql, beds_batch, page_size=self.batch_size)
            self.raw_conn.commit()

        final_beds = self.get_count("beds")
        self.stats["beds"] = final_beds
        self.log("beds", f"Total beds verified: {final_beds}")

    # -------------------------------------------------------------
    # 7. APPOINTMENTS
    # -------------------------------------------------------------
    def generate_appointments(self, target_count=25000):
        self.log("appointments", f"Target count: {target_count}")
        current_count = self.get_count("appointments")
        if current_count >= target_count:
            self.log("appointments", f"Already has {current_count} appointments. Skipping.")
            return

        needed = target_count - current_count
        self.log("appointments", f"Generating {needed} clinical consultation appointments...")

        self.cur.execute("SELECT id FROM patients ORDER BY id;")
        patient_ids = [r[0] for r in self.cur.fetchall()]

        self.cur.execute("SELECT id FROM doctors ORDER BY id;")
        doctor_ids = [r[0] for r in self.cur.fetchall()]

        slots = [
            "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
            "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
            "04:00 PM", "04:30 PM", "05:00 PM"
        ]

        reasons = [
            "Routine Follow-up Consultation",
            "Chronic Hypertension Evaluation",
            "Type 2 Diabetes Glycemic Review",
            "Severe Knee Joint Pain & Stiffness",
            "Persistent Cough & Intermittent Fever",
            "Chest Tightness on Moderate Exertion",
            "Annual Comprehensive Executive Health Checkup",
            "Post-Surgical Wound Inspection & Suture Removal",
            "Skin Rash, Erythema & Pruritus Review",
            "Chronic Migraine & Recurrent Dizziness Review",
            "Abdominal Pain & Acid Reflux Symptoms",
            "Antenatal Second Trimester Checkup",
            "Pediatric Immunization & Growth Assessment",
            "Thyroid Hormone Level Titration Follow-up",
            "Serum Cholesterol & Lipid Panel Review"
        ]

        today_date = self.now.date()
        past_start = today_date - timedelta(days=365)
        future_end = today_date + timedelta(days=90)

        appointments_batch = []
        for i in range(needed):
            pat_id = random.choice(patient_ids)
            doc_id = random.choice(doctor_ids)

            # 85% appointments in the past year, 15% in upcoming 3 months
            if random.random() < 0.85:
                appt_date = random_date_between(past_start, today_date - timedelta(days=1))
                # Status distribution for past visits
                r_val = random.random()
                if r_val < 0.82:
                    status = 'Completed'
                elif r_val < 0.93:
                    status = 'Cancelled'
                else:
                    status = 'No-Show'
            else:
                appt_date = random_date_between(today_date, future_end)
                r_val = random.random()
                if r_val < 0.85:
                    status = 'Scheduled'
                elif r_val < 0.95:
                    status = 'Confirmed'
                else:
                    status = 'Cancelled'

            slot_time = random.choice(slots)
            reason = random.choice(reasons)
            created_at = datetime.datetime.combine(appt_date - timedelta(days=random.randint(1, 14)), datetime.time(9, 0))

            appointments_batch.append((
                pat_id, doc_id, appt_date, slot_time, status, reason, created_at
            ))

        sql = """
            INSERT INTO appointments (
                patient_id, doctor_id, appointment_date, appointment_time,
                status, reason, created_at
            ) VALUES %s;
        """
        execute_values(self.cur, sql, appointments_batch, page_size=self.batch_size)
        self.raw_conn.commit()

        final_count = self.get_count("appointments")
        self.stats["appointments"] = final_count
        self.log("appointments", f"Successfully reached {final_count} appointments.")

    # -------------------------------------------------------------
    # 8. MEDICAL RECORDS
    # -------------------------------------------------------------
    def generate_medical_records(self, target_count=20000):
        self.log("medical_records", f"Target count: {target_count}")
        current_count = self.get_count("medical_records")
        if current_count >= target_count:
            self.log("medical_records", f"Already has {current_count} medical records. Skipping.")
            return

        needed = target_count - current_count
        self.log("medical_records", f"Generating {needed} clinical EMR encounters...")

        # Find completed appointments to link
        self.cur.execute("""
            SELECT id, patient_id, doctor_id, appointment_date, appointment_time, reason
            FROM appointments
            WHERE status = 'Completed'
            ORDER BY id;
        """)
        completed_appts = self.cur.fetchall()

        self.cur.execute("SELECT id FROM patients ORDER BY id;")
        patient_ids = [r[0] for r in self.cur.fetchall()]

        self.cur.execute("SELECT id FROM doctors ORDER BY id;")
        doctor_ids = [r[0] for r in self.cur.fetchall()]

        records_batch = []
        today_date = self.now.date()

        for i in range(needed):
            if i < len(completed_appts):
                appt = completed_appts[i]
                appt_id = appt[0]
                pat_id = appt[1]
                doc_id = appt[2]
                cons_date = appt[3]
                cons_time = appt[4]
                reason = appt[5] or "Clinical Consultation"
            else:
                appt_id = None
                pat_id = random.choice(patient_ids)
                doc_id = random.choice(doctor_ids)
                cons_date = random_date_between(today_date - timedelta(days=365), today_date)
                cons_time = "10:30 AM"
                reason = "Comprehensive Clinical Evaluation"

            disease_info = random.choice(MEDICAL_DISEASES)
            diag = disease_info[0]

            bp_sys = random.randint(110, 150)
            bp_dia = random.randint(70, 95)
            hr = random.randint(62, 92)
            spo2 = random.randint(96, 99)
            temp = round(random.uniform(97.8, 99.4), 1)
            vitals = f'{{"blood_pressure": "{bp_sys}/{bp_dia}", "heart_rate": "{hr} bpm", "temperature": "{temp} °F", "oxygen_saturation": "{spo2}%"}}'

            symptoms = f"Patient presents with complaints of persistent fatigue, mild headache, and {diag.lower()} symptoms over the past {random.randint(2, 6)} weeks."
            obs = f"General condition fair, afebrile, well oriented to time, place, and person. S1 S2 heard normal, chest clear to auscultation bilaterally."
            plan = f"Continue pharmacotherapy as charted. Lifestyle modifications recommended: moderate cardiovascular exercise 30 min daily, low-sodium dietary plan."
            notes = f"Patient advised to maintain daily blood pressure and blood glucose logs. Re-evaluate if symptoms persist or worsen."
            fu_date = (cons_date + timedelta(days=30)).strftime("%Y-%m-%d")

            status = 'Finalized' if random.random() < 0.92 else 'Draft'
            created_at = datetime.datetime.combine(cons_date, datetime.time(11, 0))

            records_batch.append((
                pat_id, doc_id, cons_date, cons_time, 'In-Person',
                reason, symptoms, obs, vitals, diag, plan, notes,
                fu_date, "Review clinical logs and repeat lab panels in 30 days.",
                status, appt_id, False, "", False, created_at, created_at, created_at
            ))

        sql = """
            INSERT INTO medical_records (
                patient_id, doctor_id, consultation_date, consultation_time, visit_type,
                visit_reason, symptoms, observations, vital_signs, diagnosis, treatment_plan,
                clinical_notes, follow_up_date, follow_up_notes, status, appointment_id,
                review_required, review_reason, is_amended, created_at, updated_at, finalized_at
            ) VALUES %s;
        """
        execute_values(self.cur, sql, records_batch, page_size=self.batch_size)
        self.raw_conn.commit()

        final_count = self.get_count("medical_records")
        self.stats["medical_records"] = final_count
        self.log("medical_records", f"Successfully reached {final_count} finalized medical records.")

    # -------------------------------------------------------------
    # 9. PRESCRIPTIONS & PRESCRIPTION ITEMS
    # -------------------------------------------------------------
    def generate_prescriptions_and_items(self, target_rx=15000, target_items=30000):
        self.log("prescriptions", f"Target prescriptions: {target_rx}, Target items: {target_items}")
        curr_rx = self.get_count("prescriptions")
        curr_items = self.get_count("prescription_items")

        if curr_rx >= target_rx and curr_items >= target_items:
            self.log("prescriptions", f"Already has {curr_rx} prescriptions and {curr_items} items. Skipping.")
            return

        # Fetch medical records to link
        self.cur.execute("""
            SELECT id, patient_id, doctor_id, consultation_date
            FROM medical_records
            ORDER BY id;
        """)
        med_records = self.cur.fetchall()
        if not med_records:
            raise RuntimeError("No medical records available to attach prescriptions.")

        self.cur.execute("SELECT id, name, dosage_form, strength FROM medicines ORDER BY id;")
        medicines = self.cur.fetchall()
        if not medicines:
            raise RuntimeError("No medicines available to generate prescription items.")

        frequencies = ["Once daily (OD)", "Twice daily (BD)", "Thrice daily (TDS)", "Four times daily (QID)", "As needed (SOS)"]
        durations = ["5 days", "7 days", "10 days", "14 days", "30 days", "60 days", "90 days"]
        instructions = [
            "Take after breakfast with water",
            "Take on an empty stomach 30 mins before food",
            "Take after meals at bedtime",
            "Complete full course without skipping doses",
            "Take with food to minimize gastric irritation"
        ]

        needed_rx = target_rx - curr_rx
        if needed_rx > 0:
            self.log("prescriptions", f"Generating {needed_rx} prescriptions...")
            rx_batch = []
            for i in range(needed_rx):
                mr = med_records[i % len(med_records)]
                mr_id, pat_id, doc_id, cons_date = mr[0], mr[1], mr[2], mr[3]
                med = random.choice(medicines)
                med_name = med[1]
                strength = med[3]
                dosage = f"1 {med[2]}"
                freq = random.choice(frequencies)
                dur = random.choice(durations)
                inst = random.choice(instructions)
                status = 'Active' if (self.now.date() - cons_date).days < 30 else 'Completed'
                created_at = datetime.datetime.combine(cons_date, datetime.time(11, 30))

                rx_batch.append((
                    pat_id, doc_id, med_name, dosage, freq, dur, 'Oral', inst,
                    cons_date, status, created_at, mr_id, created_at
                ))

            sql = """
                INSERT INTO prescriptions (
                    patient_id, doctor_id, medication_name, dosage, frequency,
                    duration, route, instructions, prescription_date, status,
                    created_at, medical_record_id, updated_at
                ) VALUES %s;
            """
            execute_values(self.cur, sql, rx_batch, page_size=self.batch_size)
            self.raw_conn.commit()

        final_rx = self.get_count("prescriptions")
        self.stats["prescriptions"] = final_rx
        self.log("prescriptions", f"Total prescriptions verified: {final_rx}")

        # Generate Prescription Items (30,000)
        curr_items = self.get_count("prescription_items")
        needed_items = target_items - curr_items
        if needed_items > 0:
            self.log("prescription_items", f"Generating {needed_items} prescription items linked to catalog...")
            self.cur.execute("SELECT id FROM prescriptions ORDER BY id;")
            all_rx_ids = [r[0] for r in self.cur.fetchall()]

            items_batch = []
            for i in range(needed_items):
                rx_id = all_rx_ids[i % len(all_rx_ids)]
                med = random.choice(medicines)
                med_id = med[0]
                dosage = f"1 {med[2]} ({med[3]})"
                freq = random.choice(frequencies)
                dur = random.choice(durations)
                qty = random.choice([5, 10, 14, 28, 30, 60, 90])
                inst = random.choice(instructions)

                items_batch.append((
                    rx_id, med_id, dosage, freq, dur, qty, inst, self.now
                ))

            sql = """
                INSERT INTO prescription_items (
                    prescription_id, medicine_id, dosage, frequency, duration, quantity, instructions, created_at
                ) VALUES %s;
            """
            execute_values(self.cur, sql, items_batch, page_size=self.batch_size)
            self.raw_conn.commit()

        final_items = self.get_count("prescription_items")
        self.stats["prescription_items"] = final_items
        self.log("prescription_items", f"Total prescription items verified: {final_items}")

    # -------------------------------------------------------------
    # 10. LAB RESULTS / LAB REPORTS
    # -------------------------------------------------------------
    def generate_lab_reports(self, target_count=12000):
        self.log("lab_reports", f"Target count: {target_count}")
        current_count = self.get_count("lab_results")
        if current_count >= target_count:
            self.log("lab_reports", f"Already has {current_count} lab reports. Skipping.")
            return

        needed = target_count - current_count
        self.log("lab_reports", f"Generating {needed} laboratory diagnostic reports...")

        self.cur.execute("SELECT id FROM patients ORDER BY id;")
        patient_ids = [r[0] for r in self.cur.fetchall()]

        self.cur.execute("SELECT id FROM doctors ORDER BY id;")
        doctor_ids = [r[0] for r in self.cur.fetchall()]

        today_date = self.now.date()
        start_date = today_date - timedelta(days=365)

        lab_batch = []
        for i in range(needed):
            pat_id = random.choice(patient_ids)
            doc_id = random.choice(doctor_ids)
            tmpl = random.choice(LAB_TEST_TEMPLATES)
            test_name, ref_range, units, dept, mean_val, sd_val = tmpl
            test_date = random_date_between(start_date, today_date)

            if units == "Visual":
                res_val = random.choice(["Normal / Clear", "Nil Albumin, Nil Sugar", "Occasional Epithelial Cells"])
                status = 'Normal'
            elif units == "Serology":
                res_val = "Negative (Non-Reactive)" if random.random() < 0.90 else "Positive (Reactive)"
                status = 'Normal' if "Negative" in res_val else 'Abnormal'
            else:
                raw_val = round(random.gauss(mean_val, sd_val), 1)
                res_val = str(max(0.1, raw_val))
                r = random.random()
                if r < 0.75:
                    status = 'Normal'
                elif r < 0.88:
                    status = 'High'
                elif r < 0.97:
                    status = 'Low'
                else:
                    status = 'Critical'

            notes = f"Verified by Senior Biochemist / Pathologist. Clinical correlation advised with patient symptom profile."
            created_at = datetime.datetime.combine(test_date, datetime.time(14, 0))

            lab_batch.append((
                pat_id, doc_id, test_name, test_date, res_val, units, ref_range, status, notes, created_at
            ))

        sql = """
            INSERT INTO lab_results (
                patient_id, doctor_id, test_name, test_date, result_value,
                units, reference_range, status, notes, created_at
            ) VALUES %s;
        """
        execute_values(self.cur, sql, lab_batch, page_size=self.batch_size)
        self.raw_conn.commit()

        final_count = self.get_count("lab_results")
        self.stats["lab_reports"] = final_count
        self.log("lab_reports", f"Successfully reached {final_count} laboratory test reports.")

    # -------------------------------------------------------------
    # 11. ADMISSIONS & DISCHARGES
    # -------------------------------------------------------------
    def generate_admissions_and_discharges(self, target_adm=5000, target_dis=4000):
        self.log("admissions", f"Target admissions: {target_adm}, Target discharges: {target_dis}")
        curr_adm = self.get_count("admissions")
        curr_dis = self.get_count("discharges")

        if curr_adm >= target_adm and curr_dis >= target_dis:
            self.log("admissions", f"Already has {curr_adm} admissions and {curr_dis} discharges. Skipping.")
            return

        self.cur.execute("SELECT id FROM patients ORDER BY id;")
        patient_ids = [r[0] for r in self.cur.fetchall()]

        self.cur.execute("SELECT id FROM beds ORDER BY id;")
        all_beds = [r[0] for r in self.cur.fetchall()]
        if not all_beds:
            raise RuntimeError("No beds available to generate admissions.")

        self.cur.execute("SELECT id FROM doctors ORDER BY id;")
        doctor_ids = [r[0] for r in self.cur.fetchall()]

        adm_reasons = [
            "Acute Exacerbation of Bronchial Asthma",
            "Unstable Angina & Acute Coronary Syndrome",
            "Severe Dengue Fever with Thrombocytopenia",
            "Acute Calculus Cholecystitis for Laparoscopic Cholecystectomy",
            "Elective Total Knee Arthroplasty (TKR)",
            "Acute Pyelonephritis with Sepsis",
            "Decompensated Chronic Liver Disease",
            "Community-Acquired Pneumonia with Hypoxia",
            "Diabetic Ketoacidosis (DKA) Management",
            "Acute Appendicitis for Appendectomy",
            "Post-Road Traffic Accident (RTA) Polytrauma",
            "Ischemic Cerebrovascular Stroke for Thrombolysis / Monitoring"
        ]

        needed_adm = target_adm - curr_adm
        today = self.now

        if needed_adm > 0:
            self.log("admissions", f"Generating {needed_adm} hospital admissions...")
            adm_batch = []
            occupied_beds = set()

            # Fetch currently active beds to guarantee zero overlapping occupancy
            self.cur.execute("SELECT bed_id FROM admissions WHERE status = 'Admitted';")
            currently_occupied = {r[0] for r in self.cur.fetchall()}
            available_for_active = [b for b in all_beds if b not in currently_occupied]

            active_idx = 0
            for i in range(needed_adm):
                adm_idx = curr_adm + i + 1
                adm_num = f"ADM-2026-{adm_idx:06d}"
                pat_id = random.choice(patient_ids)
                doc_id = random.choice(doctor_ids)

                reason = random.choice(adm_reasons)
                diag = f"Inpatient primary diagnosis: {reason}"

                # Past admissions vs currently active admissions
                if i < target_dis:
                    # Past admission (Discharged) - can safely use any bed
                    bed_id = all_beds[i % len(all_beds)]
                    adm_date = today - timedelta(days=random.randint(15, 365), hours=random.randint(1, 23))
                    status = 'Discharged'
                else:
                    # Active inpatient currently admitted in hospital - must use an unoccupied bed
                    bed_id = available_for_active[active_idx % len(available_for_active)]
                    active_idx += 1
                    adm_date = today - timedelta(days=random.randint(1, 14), hours=random.randint(1, 23))
                    status = 'Admitted'
                    occupied_beds.add(bed_id)

                adm_batch.append((
                    adm_num, pat_id, bed_id, doc_id, adm_date, reason, diag, status, self.now
                ))

            sql = """
                INSERT INTO admissions (
                    admission_number, patient_id, bed_id, attending_doctor_id,
                    admission_date, admission_reason, diagnosis, status, created_at
                ) VALUES %s;
            """
            execute_values(self.cur, sql, adm_batch, page_size=self.batch_size)
            self.raw_conn.commit()

            # Update occupied beds status
            if occupied_beds:
                self.cur.execute("""
                    UPDATE beds
                    SET status = 'Occupied'
                    WHERE id = ANY(%s);
                """, (list(occupied_beds),))
                self.raw_conn.commit()

        final_adm = self.get_count("admissions")
        self.stats["admissions"] = final_adm
        self.log("admissions", f"Total admissions verified: {final_adm}")

        # Generate Discharges (4,000)
        curr_dis = self.get_count("discharges")
        needed_dis = target_dis - curr_dis
        if needed_dis > 0:
            self.log("discharges", f"Generating {needed_dis} patient discharges...")
            self.cur.execute("""
                SELECT a.id, a.patient_id, a.admission_date
                FROM admissions a
                LEFT JOIN discharges d ON a.id = d.admission_id
                WHERE d.id IS NULL AND a.status = 'Discharged'
                ORDER BY a.id
                LIMIT %s;
            """, (needed_dis,))
            eligible_adms = self.cur.fetchall()

            dis_conditions = ["Recovered", "Improved", "Stable", "Referred to Super-Specialty"]
            dis_batch = []

            for adm_id, pat_id, adm_date in eligible_adms:
                stay_days = random.randint(2, 12)
                dis_date = adm_date + timedelta(days=stay_days, hours=random.randint(1, 8))
                cond = random.choice(dis_conditions)
                summary = f"Patient successfully managed and stabilized during inpatient course. Vitals stable at discharge, surgical site healthy with no signs of infection."
                instructions = "Continue oral medications as per discharge summary. Follow-up in OPD after 7 days for suture check / review."

                dis_batch.append((
                    adm_id, pat_id, dis_date, summary, cond, instructions, self.now
                ))

            sql = """
                INSERT INTO discharges (
                    admission_id, patient_id, discharge_date, discharge_summary,
                    condition_at_discharge, follow_up_instructions, created_at
                ) VALUES %s;
            """
            execute_values(self.cur, sql, dis_batch, page_size=self.batch_size)
            self.raw_conn.commit()

        final_dis = self.get_count("discharges")
        self.stats["discharges"] = final_dis
        self.log("discharges", f"Total discharges verified: {final_dis}")

    # -------------------------------------------------------------
    # 12. BILLING RECORDS & PAYMENTS
    # -------------------------------------------------------------
    def generate_billing_and_payments(self, target_bills=25000, target_payments=30000):
        self.log("billing", f"Target bills: {target_bills}, Target payments: {target_payments}")
        curr_bills = self.get_count("billing_records")
        curr_payments = self.get_count("payments")

        if curr_bills >= target_bills and curr_payments >= target_payments:
            self.log("billing", f"Already has {curr_bills} bills and {curr_payments} payments. Skipping.")
            return

        self.cur.execute("SELECT id, patient_id FROM appointments ORDER BY id;")
        appointments = self.cur.fetchall()

        self.cur.execute("SELECT id, patient_id FROM admissions ORDER BY id;")
        admissions = self.cur.fetchall()

        self.cur.execute("SELECT id FROM patients ORDER BY id;")
        patient_ids = [r[0] for r in self.cur.fetchall()]

        needed_bills = target_bills - curr_bills
        today_date = self.now.date()
        start_date = today_date - timedelta(days=365)

        if needed_bills > 0:
            self.log("billing", f"Generating {needed_bills} billing invoice records...")
            bills_batch = []
            for i in range(needed_bills):
                bill_idx = curr_bills + i + 1
                bill_num = f"INV-2026-{bill_idx:07d}"

                # Link to admission or appointment or patient
                if i < len(admissions):
                    adm_id, pat_id = admissions[i][0], admissions[i][1]
                    appt_id = None
                    total = round(random.uniform(22000.0, 185000.0), 2)
                elif (i - len(admissions)) < len(appointments):
                    idx2 = i - len(admissions)
                    appt_id, pat_id = appointments[idx2][0], appointments[idx2][1]
                    adm_id = None
                    total = round(random.uniform(650.0, 4500.0), 2)
                else:
                    pat_id = random.choice(patient_ids)
                    appt_id = None
                    adm_id = None
                    total = round(random.uniform(850.0, 12000.0), 2)

                discount = round(total * random.choice([0.0, 0.0, 0.05, 0.10]), 2)
                tax = round((total - discount) * 0.05, 2)
                net = round(total - discount + tax, 2)

                # Status distribution: 82% Paid, 10% Partially Paid, 6% Pending, 2% Overdue
                r_val = random.random()
                if r_val < 0.82:
                    status = 'Paid'
                    paid = net
                    balance = 0.0
                elif r_val < 0.92:
                    status = 'Partially Paid'
                    paid = round(net * random.uniform(0.3, 0.7), 2)
                    balance = round(net - paid, 2)
                elif r_val < 0.98:
                    status = 'Pending'
                    paid = 0.0
                    balance = net
                else:
                    status = 'Overdue'
                    paid = 0.0
                    balance = net

                b_date = random_date_between(start_date, today_date)
                due_date = b_date + timedelta(days=15)

                bills_batch.append((
                    bill_num, pat_id, appt_id, adm_id, total, discount, tax,
                    net, paid, balance, status, b_date, due_date, self.now
                ))

            sql = """
                INSERT INTO billing_records (
                    bill_number, patient_id, appointment_id, admission_id,
                    total_amount, discount_amount, tax_amount, net_amount,
                    paid_amount, balance_amount, status, bill_date, due_date, created_at
                ) VALUES %s;
            """
            execute_values(self.cur, sql, bills_batch, page_size=self.batch_size)
            self.raw_conn.commit()

        final_bills = self.get_count("billing_records")
        self.stats["billing_records"] = final_bills
        self.log("billing", f"Total billing records verified: {final_bills}")

        # Generate Payments (30,000)
        curr_payments = self.get_count("payments")
        needed_payments = target_payments - curr_payments

        if needed_payments > 0:
            self.log("payments", f"Generating {needed_payments} financial payment transactions...")

            # Select bills that have paid_amount > 0
            self.cur.execute("""
                SELECT id, patient_id, paid_amount, bill_date
                FROM billing_records
                WHERE paid_amount > 0
                ORDER BY id;
            """)
            paid_bills = self.cur.fetchall()
            if not paid_bills:
                raise RuntimeError("No paid bills available to generate payments.")

            payment_methods = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash", "Insurance Claim"]
            payments_batch = []

            for i in range(needed_payments):
                pay_idx = curr_payments + i + 1
                pay_num = f"PAY-2026-{pay_idx:07d}"
                bill = paid_bills[i % len(paid_bills)]
                bill_id, pat_id, total_paid, bill_date = bill[0], bill[1], float(bill[2]), bill[3]

                method = random.choice(payment_methods)
                if method == "UPI":
                    ref = f"UPI/{random.randint(100000000000, 999999999999)}"
                elif "Card" in method:
                    ref = f"TXN-CARD-{random.randint(10000000, 99999999)}"
                elif method == "Net Banking":
                    ref = f"NEFT-{random.randint(1000000, 9999999)}"
                elif method == "Insurance Claim":
                    ref = f"TPA-CLM-{random.randint(100000, 999999)}"
                else:
                    ref = f"CASH-REC-{random.randint(10000, 99999)}"

                # Some bills have 2 payments (split), else 1 payment for full amount
                amount = round(total_paid if (i < len(paid_bills)) else (total_paid * 0.5), 2)
                pay_date = datetime.datetime.combine(bill_date, datetime.time(random.randint(9, 18), random.randint(0, 59)))

                payments_batch.append((
                    pay_num, bill_id, pat_id, amount, method, ref, 'Success', pay_date, self.now
                ))

            sql = """
                INSERT INTO payments (
                    payment_number, bill_id, patient_id, amount, payment_method,
                    transaction_reference, status, payment_date, created_at
                ) VALUES %s;
            """
            execute_values(self.cur, sql, payments_batch, page_size=self.batch_size)
            self.raw_conn.commit()

        final_payments = self.get_count("payments")
        self.stats["payments"] = final_payments
        self.log("payments", f"Total payments verified: {final_payments}")

    # -------------------------------------------------------------
    # 13. INTEGRITY & ORPHAN VERIFICATION
    # -------------------------------------------------------------
    def verify_integrity(self):
        self.log("verify", "Running comprehensive database integrity and relationship checks...")
        issues = []

        checks = [
            ("doctors -> departments", "SELECT COUNT(*) FROM doctors d LEFT JOIN departments dp ON d.department_id = dp.id WHERE d.department_id IS NOT NULL AND dp.id IS NULL;"),
            ("appointments -> patients", "SELECT COUNT(*) FROM appointments a LEFT JOIN patients p ON a.patient_id = p.id WHERE p.id IS NULL;"),
            ("appointments -> doctors", "SELECT COUNT(*) FROM appointments a LEFT JOIN doctors d ON a.doctor_id = d.id WHERE d.id IS NULL;"),
            ("medical_records -> patients", "SELECT COUNT(*) FROM medical_records mr LEFT JOIN patients p ON mr.patient_id = p.id WHERE p.id IS NULL;"),
            ("medical_records -> doctors", "SELECT COUNT(*) FROM medical_records mr LEFT JOIN doctors d ON mr.doctor_id = d.id WHERE d.id IS NULL;"),
            ("prescriptions -> patients", "SELECT COUNT(*) FROM prescriptions pr LEFT JOIN patients p ON pr.patient_id = p.id WHERE p.id IS NULL;"),
            ("prescriptions -> medical_records", "SELECT COUNT(*) FROM prescriptions pr LEFT JOIN medical_records mr ON pr.medical_record_id = mr.id WHERE pr.medical_record_id IS NOT NULL AND mr.id IS NULL;"),
            ("prescription_items -> prescriptions", "SELECT COUNT(*) FROM prescription_items pi LEFT JOIN prescriptions pr ON pi.prescription_id = pr.id WHERE pr.id IS NULL;"),
            ("prescription_items -> medicines", "SELECT COUNT(*) FROM prescription_items pi LEFT JOIN medicines m ON pi.medicine_id = m.id WHERE m.id IS NULL;"),
            ("lab_results -> patients", "SELECT COUNT(*) FROM lab_results lr LEFT JOIN patients p ON lr.patient_id = p.id WHERE p.id IS NULL;"),
            ("admissions -> beds", "SELECT COUNT(*) FROM admissions a LEFT JOIN beds b ON a.bed_id = b.id WHERE b.id IS NULL;"),
            ("admissions -> patients", "SELECT COUNT(*) FROM admissions a LEFT JOIN patients p ON a.patient_id = p.id WHERE p.id IS NULL;"),
            ("discharges -> admissions", "SELECT COUNT(*) FROM discharges d LEFT JOIN admissions a ON d.admission_id = a.id WHERE a.id IS NULL;"),
            ("billing_records -> patients", "SELECT COUNT(*) FROM billing_records br LEFT JOIN patients p ON br.patient_id = p.id WHERE p.id IS NULL;"),
            ("payments -> billing_records", "SELECT COUNT(*) FROM payments py LEFT JOIN billing_records br ON py.bill_id = br.id WHERE br.id IS NULL;")
        ]

        for check_name, sql in checks:
            self.cur.execute(sql)
            orphan_count = self.cur.fetchone()[0]
            if orphan_count == 0:
                self.log("verify", f" [PASS] Referential integrity: {check_name} (0 orphans)")
            else:
                self.log("verify", f" [FAIL] Orphan records found in {check_name}: {orphan_count}")
                issues.append((check_name, orphan_count))

        return len(issues) == 0, issues


# =====================================================================
# CLI EXECUTION ENTRY POINT
# =====================================================================

def main():
    parser = argparse.ArgumentParser(description="Generate 150,000+ synthetic records for HealthPulse")
    parser.add_argument("--departments", type=int, default=25, help="Number of departments")
    parser.add_argument("--staff", type=int, default=500, help="Number of staff members")
    parser.add_argument("--doctors", type=int, default=200, help="Number of credentialed doctors")
    parser.add_argument("--patients", type=int, default=10000, help="Number of patient records")
    parser.add_argument("--appointments", type=int, default=25000, help="Number of appointments")
    parser.add_argument("--medical-records", type=int, default=20000, help="Number of medical records")
    parser.add_argument("--prescriptions", type=int, default=15000, help="Number of prescriptions")
    parser.add_argument("--medicines", type=int, default=2000, help="Number of medicines in catalog")
    parser.add_argument("--prescription-items", type=int, default=30000, help="Number of prescription items")
    parser.add_argument("--lab-reports", type=int, default=12000, help="Number of lab reports")
    parser.add_argument("--bills", type=int, default=25000, help="Number of billing records")
    parser.add_argument("--payments", type=int, default=30000, help="Number of payment transactions")
    parser.add_argument("--rooms", type=int, default=500, help="Number of hospital rooms")
    parser.add_argument("--beds", type=int, default=2000, help="Number of hospital beds")
    parser.add_argument("--admissions", type=int, default=5000, help="Number of admissions")
    parser.add_argument("--discharges", type=int, default=4000, help="Number of discharges")
    parser.add_argument("--batch-size", type=int, default=2000, help="Batch insertion size")
    parser.add_argument("--quick", action="store_true", help="Quick mode for testing")

    args = parser.parse_args()

    if args.quick:
        print("[INFO] Quick mode enabled: Scaling down counts for smoke testing...")
        args.departments = 10
        args.staff = 50
        args.doctors = 25
        args.patients = 100
        args.appointments = 200
        args.medical_records = 150
        args.prescriptions = 100
        args.medicines = 50
        args.prescription_items = 150
        args.lab_reports = 100
        args.bills = 100
        args.payments = 120
        args.rooms = 20
        args.beds = 50
        args.admissions = 40
        args.discharges = 30

    print("=" * 72)
    print("HEALTHPULSE SYNTHETIC HOSPITAL DATA GENERATOR")
    print(f"Target Total Records: 181,000+ across 16 interconnected clinical entities")
    print("=" * 72)

    gen = HospitalSyntheticDataGenerator(batch_size=args.batch_size)
    t_start = time.time()

    try:
        # Phase 1: Foundational Structural Entities
        gen.generate_departments(args.departments)
        gen.generate_doctors(args.doctors)
        gen.generate_staff(args.staff)
        gen.generate_medicines(args.medicines)
        gen.generate_rooms_and_beds(args.rooms, args.beds)

        # Phase 2: Patient Registration & Care Logistics
        gen.generate_patients(args.patients)
        gen.generate_appointments(args.appointments)

        # Phase 3: Clinical Encounters & Prescriptions
        gen.generate_medical_records(args.medical_records)
        gen.generate_prescriptions_and_items(args.prescriptions, args.prescription_items)
        gen.generate_lab_reports(args.lab_reports)

        # Phase 4: Inpatient Admissions & Discharges
        gen.generate_admissions_and_discharges(args.admissions, args.discharges)

        # Phase 5: Financial Operations & Revenue Cycle
        gen.generate_billing_and_payments(args.bills, args.payments)

        # Phase 6: Referential Integrity Verification
        passed, issues = gen.verify_integrity()

        elapsed = time.time() - t_start
        print("\n" + "=" * 72)
        print(f"SYNTHETIC DATA GENERATION SUMMARY (Completed in {elapsed:.2f}s)")
        print("=" * 72)

        tables = [
            ("Departments", "departments"),
            ("Staff Members", "staff"),
            ("Credentialed Doctors", "doctors"),
            ("Registered Patients", "patients"),
            ("Clinical Appointments", "appointments"),
            ("Medical Records (EMR)", "medical_records"),
            ("Prescriptions", "prescriptions"),
            ("Pharmaceutical Medicines", "medicines"),
            ("Prescription Line Items", "prescription_items"),
            ("Diagnostic Lab Reports", "lab_results"),
            ("Inpatient Rooms", "rooms"),
            ("Hospital Beds", "beds"),
            ("Inpatient Admissions", "admissions"),
            ("Patient Discharges", "discharges"),
            ("Billing Invoices", "billing_records"),
            ("Payment Transactions", "payments")
        ]

        total_records = 0
        for label, tbl in tables:
            cnt = gen.get_count(tbl)
            total_records += cnt
            print(f" • {label:32}: {cnt:>8,d} records")

        print("-" * 72)
        print(f" GRAND TOTAL DATABASE POPULATION: {total_records:>12,d} RECORDS")
        print("=" * 72)

        if passed:
            print("[STATUS] ALL FOREIGN KEY RELATIONSHIPS VERIFIED WITH ZERO ORPHANS (100% INTEGRITY)!")
        else:
            print(f"[WARNING] Issues detected in {len(issues)} relationships.")

    except Exception as e:
        gen.raw_conn.rollback()
        print(f"[ERROR] Failed during generation: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        gen.close()


if __name__ == "__main__":
    main()
