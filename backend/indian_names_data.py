"""
HealthPulse HMS - Pan-Indian Names & Demographic Library
Provides culturally authentic, diverse, and realistic names and addresses across all regions of India:
- North India (Hindi belt, Punjab, Haryana, Himachal Pradesh, Jammu & Kashmir, Rajasthan)
- South India (Tamil Nadu, Telangana, Andhra Pradesh, Karnataka, Kerala)
- East India (West Bengal, Odisha, Assam, Northeast)
- West India (Maharashtra, Gujarat, Goa)
- Central India (Madhya Pradesh, Chhattisgarh)
"""

INDIAN_MALE_FIRST_NAMES = [
    # North & Central India
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya",
    "Atharva", "Kabir", "Rudra", "Dhruv", "Rishi", "Dev", "Rajesh", "Amit", "Suresh", "Ramesh",
    "Manoj", "Deepak", "Vikram", "Sunil", "Anil", "Pradeep", "Ashok", "Sanjay", "Praveen", "Mahesh",
    "Girish", "Kishore", "Raghav", "Madhav", "Gautam", "Naveen", "Satish", "Arun", "Brijesh", "Chetan",
    "Dinesh", "Ganesh", "Hemant", "Jagdish", "Kailash", "Lalit", "Mohan", "Nitin", "Pankaj", "Rakesh",
    "Sachin", "Tarun", "Umesh", "Vinod", "Yogesh", "Harish", "Abhinav", "Alok", "Anant", "Ansh",
    "Anurag", "Aryan", "Bharat", "Bhupendra", "Bhuvnesh", "Chaitanya", "Chirag", "Darshan", "Devesh", "Divyansh",
    "Harsh", "Harshit", "Himanshu", "Jatin", "Jayesh", "Jitendra", "Kapil", "Karan", "Kshitij", "Kuldeep",
    "Kush", "Lokesh", "Madhur", "Manish", "Mayank", "Mohit", "Mukul", "Nakul", "Naman", "Nishant",
    "Parth", "Piyush", "Pranay", "Prashant", "Priyanshu", "Puneet", "Rahul", "Rajat", "Rajeev", "Rishabh",
    "Rohit", "Sahil", "Samar", "Samarth", "Sandeep", "Saurabh", "Shikhar", "Shivam", "Shlok", "Siddharth",
    "Somesh", "Sparsh", "Subhash", "Sudhir", "Sumit", "Suraj", "Sushant", "Tushar", "Utkarsh", "Vaibhav",
    "Varun", "Vedant", "Vidur", "Vikas", "Vishal", "Yash", "Yuvraj", "Akash", "Aniket", "Ashutosh",
    "Ayush", "Bhavya", "Deepanshu", "Gourav", "Hardik", "Kartik", "Kunal", "Manan", "Neeraj", "Nikhil",
    "Paras", "Prateek", "Rohan", "Sarthak", "Tanmay", "Ujjwal", "Vansh", "Vipul", "Yatin", "Aman",
    "Bhavesh", "Chandan", "Durgesh", "Gajendra", "Harendra", "Indrajit", "Jaideep", "Kamal", "Lokendra", "Manvendra",
    "Narendra", "Omkar", "Pramod", "Ravindra", "Shailendra", "Trilok", "Upendra", "Virendra", "Yaduvendra", "Brijmohan",
    "Dhanraj", "Ghanashyam", "Harivansh", "Ishwar", "Janardan", "Kripal", "Laxman", "Murari", "Narottam", "Omprakash",
    "Pukhraj", "Radheyshyam", "Satyanarayan", "Tejpal", "Udaybhan", "Vishvendra", "Yashwant", "Balwant", "Jaswant", "Kulwant",
    "Hanuman", "Mahavir", "Ramlal", "Shivcharan", "Surinder", "Balkishan", "Dayanand", "Gordhan", "Harcharan", "Kishanlal",

    # South India (Tamil Nadu, Telangana, Andhra Pradesh, Karnataka, Kerala)
    "Karthik", "Venkatesh", "Shravan", "Ashwin", "Balaji", "Chandrasekhar", "Dhanush", "Eashwar", "Gokul", "Hariharan",
    "Ilango", "Jagannath", "Kalanithi", "Lingesh", "Manikandan", "Nagarajan", "Omprakash", "Pranav", "Raghavan", "Senthil",
    "Thangavel", "Udhayan", "Vasanth", "Vignesh", "Yuvaraj", "Aravind", "Bhargav", "Charan", "Dheeraj", "Eshwar",
    "Gopinath", "Harsha", "Kalyan", "Madhu", "Nagaraju", "Pavan", "Raghunath", "Sai", "Tarun", "Uday",
    "Vamsi", "Srinivas", "Teja", "Anirudh", "Bharath", "Chethan", "Darshan", "Guru", "Harish", "Jagadish",
    "Kiran", "Lohith", "Manjunath", "Naveen", "Prajwal", "Puneeth", "Rakesh", "Sandeep", "Tejas", "Vinay",
    "Amal", "Anoop", "Arjun", "Bineesh", "Deepak", "Gokul", "Harikrishnan", "Jithin", "Mithun", "Nithin",
    "Sarath", "Unnikrishnan", "Vishnu", "Akhil", "Bipin", "Dileep", "Eby", "Febin", "Joji", "Mathew",
    "Roshan", "Vaisakh", "Ananthan", "Balamurugan", "Chidambaram", "Dinakaran", "Elumalai", "Ganesan", "Iniyan", "Jayaram",
    "Kathiresan", "Loganathan", "Murugan", "Nedunchezhian", "Palani", "Rajendran", "Saravanan", "Thirumalai", "Vadivelu", "Velmurugan",
    "Anjaneyulu", "Bramhaji", "Chennakesava", "Dharma Rao", "Eswaraiah", "Govardhan", "Hanumantha", "Innaiah", "Jagapati", "Kotiswamy",
    "Lingamurthy", "Mallikarjuna", "Nageswara", "Obulapathi", "Peda Kotaiah", "Ramabhadra", "Sambasiva", "Tirumalesh", "Venkateswarlu", "Yellaiah",
    "Basavaraj", "Chandru", "Devaraj", "Eregowda", "Girish", "Hanumantappa", "Ishwarappa", "Jayanna", "Kotresh", "Lakkanna",
    "Mallesh", "Ningappa", "Onkarappa", "Puttegowda", "Ranganatha", "Shanthakumar", "Thippeswamy", "Umesha", "Virupaksha", "Yallappa",
    "Aravindakshan", "Balakrishnan", "Chandrasekharan", "Damodaran", "Edavath", "Gangadharan", "Haridasan", "Jayaprakash", "Karunakaran", "Madhusoodanan",
    "Narayanan", "Padmanabhan", "Radhakrishnan", "Sasidharan", "Thankappan", "Unniraman", "Vasudevan", "Vijayan", "Achuthan", "Sukumaran",

    # East India (West Bengal, Odisha, Assam, Northeast)
    "Sourav", "Subrata", "Debashis", "Anirban", "Pritam", "Joydeep", "Indranil", "Arindam", "Sabyasachi", "Tanmoy",
    "Ayan", "Prosenjit", "Kaushik", "Sujoy", "Tamal", "Nilanjan", "Abhijit", "Biplab", "Chandan", "Kingshuk",
    "Pradipta", "Suman", "Tathagata", "Debabrata", "Soumyajit", "Partha", "Bikash", "Sambit", "Satyabrata", "Biswajit",
    "Soumya", "Chinmay", "Dibyakar", "Manoranjan", "Subhashis", "Siddhant", "Pranab", "Bhaskar", "Jyotishman", "Himanta",
    "Dhrubajyoti", "Rituparna", "Dipankar", "Bedanta", "Anupam", "Bodhisattwa", "Debojyoti", "Gourav", "Hirak", "Jayanta",
    "Kalyanbrata", "Manabendra", "Nirmalendu", "Prasanta", "Ranajit", "Samrat", "Tapas", "Utpal", "Bhabani", "Chittaranjan",
    "Debendranath", "Gouranga", "Hrishikesh", "Jadunath", "Kanak", "Lokenath", "Mrinal", "Nabaneet", "Phani", "Rabindra",
    "Shantanu", "Tarapada", "Upendranath", "Birendra", "Dinabandhu", "Gagan", "Hemanta", "Jagannath", "Kailash", "Lingaraj",
    "Manmohan", "Nabin", "Prafulla", "Ramachandra", "Sarat", "Trailokya", "Ananta", "Baikuntha", "Duryodhan", "Gopinath",
    "Anurag", "Barun", "Chiranjib", "Diganta", "Gunajit", "Hemkanta", "Jiten", "Kishor", "Lakheswar", "Munindra",

    # West India (Maharashtra, Gujarat, Goa)
    "Swapnil", "Nilesh", "Suhas", "Milind", "Amol", "Prasad", "Shantanu", "Makarand", "Shrirang", "Avinash",
    "Ravindra", "Dilip", "Bhushan", "Mangesh", "Shrikant", "Ajinkya", "Tanmay", "Omkar", "Shailesh", "Mandar",
    "Parag", "Ketan", "Jignesh", "Hitesh", "Mehul", "Bhavesh", "Bhavin", "Hardik", "Pratik", "Kaushal",
    "Dhaval", "Kalpesh", "Alpesh", "Hiren", "Maulik", "Tirth", "Jay", "Meet", "Harshil", "Nirav",
    "Ronak", "Rushabh", "Abhay", "Atul", "Bhalchandra", "Chetankumar", "Dattatray", "Eknath", "Gajanan", "Haribhau",
    "Jayant", "Kashinath", "Laxmikant", "Madhukar", "Namdev", "Pandurang", "Ramdas", "Sambhaji", "Tukaram", "Vitthal",
    "Baburao", "Chandrakant", "Dnyaneshwar", "Govind", "Hanmant", "Janardan", "Keshav", "Mahadev", "Narayan", "Prabhakar",
    "Raghunath", "Sitaram", "Tryambak", "Vasant", "Yashwant", "Anandkumar", "Bipinbhai", "Chandresh", "Deepakbhai", "Girishbhai",
    "Hansmukh", "Ishwarbhai", "Jayantibhai", "Kishorebhai", "Lalitbhai", "Mukeshbhai", "Nitinbhai", "Pankajbhai", "Rajeshbhai", "Sureshbhai",
    "Dharmesh", "Gaurang", "Hemal", "Jitendra", "Kiranbhai", "Manishbhai", "Paresh", "Rameshchandra", "Sanjaybhai", "Vipulbhai",

    # Punjab, Haryana & Northwest
    "Gurpreet", "Harpreet", "Manpreet", "Jaspreet", "Simranjit", "Navjot", "Amardeep", "Balwinder", "Daljit", "Gurinder",
    "Hardeep", "Inderjit", "Jagtar", "Kulwinder", "Lakhwinder", "Maninder", "Narinder", "Parminder", "Ravinder", "Sukhwinder",
    "Tejinder", "Upinder", "Varinder", "Yadwinder", "Zorawar", "Angad", "Fateh", "Zoravar", "Bikramjit", "Charanjit",
    "Devinder", "Gurcharan", "Harvinder", "Jagjit", "Kanwar", "Loveneet", "Malkit", "Navdeep", "Palwinder", "Rajinder",
    "Satwinder", "Tarsem", "Avtar", "Baldev", "Darshan", "Gurnam", "Harbhajan", "Jarnail", "Kewal", "Meharban"
]

INDIAN_FEMALE_FIRST_NAMES = [
    # North & Central India
    "Aadhya", "Diya", "Saanvi", "Ananya", "Pari", "Anika", "Navya", "Angel", "Ira", "Myra",
    "Sara", "Riya", "Prisha", "Aarohi", "Siya", "Kavya", "Avani", "Khushi", "Sneha", "Pooja",
    "Sunita", "Anita", "Deepa", "Meena", "Shweta", "Preeti", "Divya", "Swati", "Neha", "Rekha",
    "Suma", "Lakshmi", "Radha", "Parvati", "Geeta", "Seema", "Vidya", "Usha", "Shubha", "Bhavana",
    "Chitra", "Damini", "Gayatri", "Harini", "Indira", "Jyoti", "Kalyani", "Lalitha", "Madhavi", "Nandini",
    "Pallavi", "Rupali", "Sandhya", "Tanvi", "Uma", "Vandana", "Yamuna", "Meenakshi", "Aparna", "Shalini",
    "Aditi", "Akanksha", "Alka", "Amita", "Anamika", "Ankita", "Archana", "Arpita", "Barkha", "Bharti",
    "Charu", "Deepika", "Garima", "Ishita", "Jaya", "Kajal", "Kamini", "Karishma", "Komal", "Kriti",
    "Mahima", "Manisha", "Mansi", "Monika", "Muskan", "Neetu", "Nidhi", "Niharika", "Nikita", "Payal",
    "Poonam", "Prerna", "Priya", "Priyanka", "Rashi", "Ritu", "Sakshi", "Sangeeta", "Sharda", "Shikha",
    "Shristi", "Simran", "Smriti", "Sonali", "Sonam", "Srishti", "Tanu", "Tara", "Urvashi", "Varsha",
    "Vartika", "Aastha", "Bhawna", "Chhavi", "Disha", "Ekta", "Gunjan", "Juhi", "Kanika", "Mridula",
    "Nupur", "Prachi", "Richa", "Surbhi", "Tripti", "Vandita", "Yogita", "Abhilasha", "Babita", "Chandramukhi",
    "Devyani", "Hemlata", "Jaishree", "Kalpana", "Leelavati", "Manorama", "Nirmala", "Pushpa", "Rameshwari", "Saroj",
    "Shakuntala", "Sushila", "Tarabai", "Urmila", "Vimla", "Yashoda", "Basanti", "Champa", "Dropati", "Godavari",
    "Harpyari", "Indrawati", "Jankidevi", "Kasturi", "Laxmidevi", "Mishridevi", "Narbada", "Phoolwati", "Ramwati", "Santosh",

    # South India (Tamil Nadu, Telangana, Andhra Pradesh, Karnataka, Kerala)
    "Abhirami", "Bhuvaneshwari", "Charulatha", "Dhanalakshmi", "Gomathi", "Janani", "Kanchana", "Lavanya", "Mythili", "Nithya",
    "Padmavathi", "Rajeshwari", "Saranya", "Soundarya", "Thenmozhi", "Vijayalakshmi", "Sowmya", "Swetha", "Keerthana", "Anusha",
    "Bindu", "Chandana", "Deepthi", "Haritha", "Jahnavi", "Keerthi", "Lahari", "Mounika", "Navaneetha", "Pranitha",
    "Ramya", "Shirisha", "Tejaswini", "Vasundhara", "Yamini", "Apoorva", "Ashwini", "Bhargavi", "Chaithra", "Divyashree",
    "Gowri", "Harshitha", "Inchara", "Kusuma", "Meghana", "Nisarga", "Rakshitha", "Sahana", "Spoorthi", "Thejaswini",
    "Varshini", "Anjana", "Arya", "Devika", "Gopika", "Malavika", "Neethu", "Parvathy", "Reshma", "Sruthi",
    "Vineetha", "Anupama", "Athira", "Chinmayi", "Dhanya", "Ganga", "Karthika", "Meera", "Nimisha", "Remya",
    "Sandra", "Veena", "Amudhavalli", "Bakiyalakshmi", "Chellammal", "Deivanai", "Elavarasi", "Gnanambal", "Ilavenil", "Jothilakshmi",
    "Kanimozhi", "Loganayaki", "Mangalam", "Nirmaladevi", "Pachaiyammal", "Rathinam", "Selvarani", "Thillaiammal", "Vasanthi", "Yogambal",
    "Alivelu", "Bhramaramba", "Chennamma", "Durgeswari", "Erraguntla", "Girijamma", "Hymavathi", "Indumathi", "Jogulamba", "Kamakshi",
    "Lalithamba", "Manikyamma", "Nagaratnamma", "Oruganti", "Pullamma", "Ratnamala", "Satyavathi", "Tulasamma", "Varalakshmi", "Yadamma",
    "Annapoorna", "Bagamma", "Channamma", "Dyavamma", "Eramma", "Gangamma", "Hanumakka", "Iramma", "Jayalakshmi", "Kariyamma",
    "Lakkamma", "Mariyamma", "Nagamma", "Onkaramma", "Puttamma", "Rangamma", "Sharadamma", "Thimmamma", "Ujjinamma", "Venkatamma",
    "Ambujam", "Balamani", "Chandramathi", "Devakikutty", "Eswari", "Gouri Amma", "Janakiamma", "Karthyayani", "Lakshmikutty", "Madhavikutty",
    "Narayani", "Omana", "Padmini", "Radhamani", "Sarojini", "Thankam", "Unnimaya", "Vilasinikutty", "Aleyamma", "Sosamma",

    # East India (West Bengal, Odisha, Assam, Northeast)
    "Anwesha", "Debolina", "Sharmistha", "Madhurima", "Barnali", "Paramita", "Sayantani", "Mousumi", "Sreemoyee", "Koyel",
    "Payel", "Raima", "Rituparna", "Swastika", "Debashree", "Arundhati", "Monalisa", "Lipika", "Sagarika", "Subhashree",
    "Tapaswini", "Itishree", "Rashmita", "Manasi", "Snigdha", "Pranati", "Priyadarshini", "Barsha", "Geetashree", "Porismita",
    "Dimpi", "Bandita", "Bornali", "Jonali", "Mridusmita", "Aparajita", "Baisakhi", "Chaitali", "Dipanwita", "Indrani",
    "Jhumur", "Kakoli", "Lopamudra", "Madhuchhanda", "Nabanita", "Paulami", "Rupanjana", "Saswati", "Titash", "Urmimala",
    "Baishali", "Chhanda", "Dolon", "Gargi", "Haimanti", "Jayanti", "Kalyanika", "Mahua", "Nilanjana", "Piyali",
    "Runu", "Sampurna", "Tanusree", "Adyasha", "Binodini", "Chinmayee", "Dharitri", "Gitanjali", "Harapriya", "Jayashree",
    "Kalyani", "Laxmipriya", "Mamata", "Nirupama", "Pratima", "Rajashree", "Sailabala", "Trupti", "Usharani", "Bijoylaxmi",
    "Anamika", "Bhaswati", "Deepshikha", "Gitashree", "Juri", "Kalyani", "Maini", "Nibedita", "Pranita", "Rupjyoti",

    # West India (Maharashtra, Gujarat, Goa)
    "Sayali", "Snehal", "Shruti", "Rutuja", "Pradnya", "Tejaswini", "Rasika", "Mugdha", "Ketaki", "Gauri",
    "Prajakta", "Sampada", "Vaishali", "Rohini", "Swarali", "Mayuri", "Mrunal", "Kinjal", "Forum", "Hetal",
    "Urvi", "Dharti", "Krupa", "Jagruti", "Bhumi", "Riddhi", "Siddhi", "Mital", "Toral", "Foram",
    "Grishma", "Ami", "Tejal", "Panna", "Falguni", "Alka", "Bhagyashree", "Charusheela", "Deepali", "Gitanjali",
    "Hemangi", "Jayashree", "Kishori", "Madhura", "Nilima", "Pranali", "Rajshree", "Suvarna", "Tanmayee", "Ujwala",
    "Anandi", "Bhavana", "Chhayatai", "Devyani", "Godavari", "Hirabai", "Indumati", "Janabai", "Kashibai", "Lilabai",
    "Muktabai", "Narmadabai", "Parvatibai", "Radhabai", "Savitribai", "Tarabai", "Ahilyabai", "Bhagirathi", "Champabai", "Durgabai",
    "Alpaben", "Bhavnaben", "Chetnaben", "Dharmishtha", "Geetaben", "Hansaben", "Illyaben", "Jasuben", "Kokilaben", "Lilavatiben",
    "Minaben", "Naynaben", "Pragnaben", "Rekhaben", "Shilpaben", "Varshaben", "Bhartiben", "Damyantiben", "Gauriben", "Harshaben",

    # Punjab, Haryana & Northwest
    "Amrit", "Baljit", "Gurleen", "Harleen", "Jasleen", "Kirandeep", "Manjit", "Navneet", "Parveen", "Ravneet",
    "Sukhmani", "Taranpreet", "Amanat", "Avneet", "Baneet", "Dilpreet", "Harinder", "Ishmeet", "Japneet", "Kamalpreet",
    "Lovepreet", "Mehar", "Prabhjot", "Ramanpreet", "Tanveer", "Anureet", "Bhavneet", "Charanjeet", "Davinder", "Gagandeep",
    "Harkirat", "Inderpreet", "Jagroop", "Kuldeep", "Manpreet", "Navjot", "Paramjeet", "Rajwinder", "Sarabjit", "Tavleen",
    "Bimla", "Chanderkanta", "Darshana", "Geeta Rani", "Harbans", "Joginder", "Krishna Kumari", "Lajwanti", "Murti Devi", "Naseeb Kaur"
]

INDIAN_MALE_MIDDLE_NAMES = [
    "Kumar", "Chandra", "Mohan", "Nath", "Prasad", "Kant", "Lal", "Prakash", "Sundar", "Bhushan",
    "Dev", "Swaroop", "Mani", "Charan", "Anand", "Shekhar", "Bhanu", "Narain", "Saran", "Gopal",
    "Vardhan", "Dayal", "Raj", "Veer", "Pratap", "Sen", "Das", "Murthy", "Rao", "Reddy",
    "Babu", "Dutt", "Kishore", "Shankar", "Mani", "Nandan", "Sunder", "Ratan", "Deep", "Pal"
]

INDIAN_FEMALE_MIDDLE_NAMES = [
    "Kumari", "Devi", "Bai", "Priya", "Lakshmi", "Mani", "Rekha", "Prabha", "Shanti", "Rani",
    "Kanti", "Lata", "Shree", "Vati", "Bala", "Mala", "Ben", "Kaur", "Amma", "Sundari",
    "Deepa", "Jyoti", "Roopa", "Vani", "Sree"
]

INDIAN_MIDDLE_INITIALS = [
    "A.", "B.", "C.", "D.", "G.", "H.", "J.", "K.", "L.", "M.", "N.", "P.", "R.", "S.", "T.", "V."
]

INDIAN_LAST_NAMES = [
    # North India (Brahmin, Kshatriya, Vaishya, Kayastha, etc.)
    "Sharma", "Verma", "Gupta", "Singh", "Chauhan", "Rajput", "Saxena", "Mathur", "Srivastava", "Mishra",
    "Tiwari", "Pandey", "Shukla", "Dubey", "Upadhyay", "Tripathy", "Chaturvedi", "Dixit", "Awasthi", "Agnihotri",
    "Kaul", "Raina", "Dhar", "Bhat", "Dogra", "Thakur", "Rathore", "Shekhawat", "Sisodia", "Tomar",
    "Bhati", "Gehlot", "Panwar", "Solanki", "Tanwar", "Kushwaha", "Maurya", "Saini", "Yadav", "Ahir",
    "Lodhi", "Kashyap", "Baghel", "Parihar", "Chandel", "Nigam", "Asthana", "Kulshreshtha", "Bhatnagar", "Saksena",
    "Khatri", "Tandon", "Kapoor", "Malhotra", "Bhatia", "Khanna", "Sethi", "Sehgal", "Chopra", "Anand",
    "Bhasin", "Kohli", "Suri", "Taneja", "Juneja", "Batra", "Ahuja", "Vohra", "Arora", "Bajaj",
    "Mehra", "Talwar", "Sahni", "Narang", "Dhingra", "Lamba", "Wadhwa", "Grover", "Chawla", "Madaan",
    "Khurana", "Sodhi", "Trehan", "Bahl", "Kochhar", "Chhabra", "Nagpal", "Virk", "Gulati", "Luthra",

    # South India - Tamil Nadu
    "Subramanian", "Natarajan", "Venkatesan", "Balasubramanian", "Ramanathan", "Sundaram", "Chandrasekaran", "Ramakrishnan",
    "Krishnaswamy", "Parthasarathy", "Rangarajan", "Raghavan", "Srinivasan", "Varadarajan", "Ananthakrishnan", "Swaminathan",
    "Meenakshisundaram", "Alagappan", "Chidambaram", "Kalyanasundaram", "Sadasivam", "Soundararajan", "Muthukrishnan",
    "Thanikachalam", "Thirunavukkarasu", "Palanisamy", "Shanmugam", "Ganesan", "Murugan", "Kandasamy", "Kuppusamy",
    "Manickam", "Arumugam", "Sivakumar", "Saravanan", "Dharmalingam", "Perumal", "Jayaraman", "Marimuthu", "Ponnusamy",
    "Ramasamy", "Sengottaiyan", "Velusamy", "Karuppasamy", "Muthuramalingam", "Govindasamy", "Alagesan", "Elangovan",
    "Chettiar", "Gounder", "Mudaliar", "Pillai", "Iyer", "Iyengar", "Nadar", "Thevar", "Naicker", "Moopanar",

    # South India - Andhra Pradesh & Telangana
    "Reddy", "Rao", "Chowdary", "Naidu", "Raju", "Varma", "Murthy", "Prasad", "Sastry", "Somayajula",
    "Kakarla", "Guntupalli", "Velagapudi", "Daggubati", "Yalamanchili", "Konidela", "Nandamuri", "Akkineni", "Boppana", "Gadde",
    "Mandava", "Nimmagadda", "Rayapati", "Bellamkonda", "Chalasani", "Devineni", "Jasti", "Kosaraju", "Lagadapati", "Maganti",
    "Parvataneni", "Surapaneni", "Vemuri", "Yarlagadda", "Ghattamaneni", "Manchu", "Galla", "Potluri", "Kambhampati", "Bollineni",
    "Kamineni", "Alluri", "Datla", "Gokaraju", "Indukuri", "Kanumuri", "Nadimpalli", "Penmetsa", "Sagiraju", "Uddaraju",
    "Avula", "Bandaru", "Challa", "Duddukuru", "Gorantla", "Koppula", "Mekala", "Penumatsa", "Samala", "Yerra",
    "Bolisetty", "Grandhi", "Koppisetti", "Nalam", "Pynda", "Vellanki", "Ayyadevara", "Bhandaru", "Chilukuri", "Dhulipala",

    # South India - Karnataka
    "Hegde", "Gowda", "Bhat", "Shettigar", "Nayak", "Acharya", "Patil", "Kulkarni", "Deshpande", "Joshi",
    "Nadkarni", "Pai", "Prabhu", "Kamath", "Shenoy", "Kudva", "Baliga", "Mallya", "Alva", "Shetty",
    "Rai", "Bhandary", "Adiga", "Karanth", "Somayaji", "Upadhyaya", "Hebbar", "Shastry", "Achar", "Kalluraya",
    "Ballal", "Chauta", "Kadamba", "Bunts", "Poojary", "Kotian", "Amin", "Suvarna", "Karkera", "Salian",
    "Anchan", "Kunder", "Palan", "Barke", "Hiremath", "Pattanshetti", "Angadi", "Horatti", "Katti", "Metgud",
    "Savalagi", "Bellad", "Jarkiholi", "Kore", "Yediyurappa", "Bommai", "Kumaraswamy", "Shivakumar", "Deshmukh", "Inamdar",

    # South India - Kerala
    "Nair", "Menon", "Pillai", "Nambiar", "Kurian", "Varghese", "Thomas", "Panicker", "Warrier", "Namboodiri",
    "Poduval", "Marar", "Pisharody", "Kaimal", "Unnithan", "Thampi", "Kartha", "Nedungadi", "Valiathan", "Chacko",
    "Mathew", "Cherian", "Oommen", "Koshy", "Eapen", "Philip", "George", "Alexander", "Varkey", "Mammen",
    "Abraham", "Jacob", "Vaidyan", "Kizhakkayil", "Puthenveetil", "Vadakkedath", "Meledath", "Kalloor", "Tharakan", "Kattukkaran",

    # West India - Maharashtra
    "Deshmukh", "Joshi", "Kulkarni", "Shinde", "Pawar", "Chavan", "Gokhale", "Deshpande", "Tambe", "Sawant",
    "Rane", "More", "Bhosle", "Jadhav", "Gaikwad", "Salunkhe", "Kadam", "Mane", "Thorat", "Mohite",
    "Shirke", "Mahadik", "Ghatge", "Nimbalkar", "Patwardhan", "Chitnis", "Fadnavis", "Bapat", "Tilak", "Agarkar",
    "Kelkar", "Karve", "Ranade", "Gadgil", "Pendse", "Paranjpe", "Phadke", "Apte", "Godbole", "Limaye",
    "Date", "Kanitkar", "Vaze", "Modak", "Sathe", "Abhyankar", "Bhave", "Deodhar", "Gharpure", "Joglekar",
    "Karkhanis", "Kharshikar", "Mavlankar", "Natu", "Phanse", "Rajwade", "Sahasrabuddhe", "Talwalkar", "Velankar", "Walimbe",
    "Surve", "Dhumal", "Khandagale", "Lokhande", "Kamble", "Meshram", "Gawande", "Wankhede", "Borkar", "Tembhurne",

    # West India - Gujarat
    "Patel", "Shah", "Mehta", "Desai", "Parikh", "Trivedi", "Jani", "Pandya", "Shukla", "Dave",
    "Bhatt", "Raval", "Vyas", "Thaker", "Oza", "Pathak", "Majmudar", "Bakshi", "Munshi", "Vora",
    "Zaveri", "Doshi", "Gandhi", "Shroff", "Kothari", "Dalal", "Nanavati", "Contractor", "Diwan", "Choksi",
    "Merchant", "Sanghavi", "Somani", "Modi", "Sompura", "Panchal", "Soni", "Darji", "Kansara", "Salvi",
    "Gohil", "Jadeja", "Chudasama", "Waghela", "Sarvaiya", "Rathod", "Makwana", "Parmar", "Solanki", "Chavda",

    # East India - West Bengal
    "Mukherjee", "Banerjee", "Chatterjee", "Chakraborty", "Dasgupta", "Sengupta", "Ghosh", "Bose", "Das", "Sen",
    "Roy", "Majumdar", "Dutta", "Guha", "Mitra", "Sarkar", "Bhowmick", "Bhattacharya", "Ganguly", "Bagchi",
    "Sanyal", "Lahiri", "Maitra", "Samanta", "Pal", "De", "Kundu", "Nandi", "Mallick", "Poddar",
    "Sadhukhan", "Pramanik", "Adhikary", "Haldar", "Biswas", "Karmakar", "Barman", "Mandal", "Bera", "Giri",
    "Maiti", "Manna", "Patra", "Sasmal", "Midya", "Panja", "Pahari", "Gayen", "Pakhira", "Bhattacharjee",

    # East India - Odisha
    "Mohanty", "Patnaik", "Mishra", "Dash", "Tripathy", "Pradhan", "Nayak", "Rout", "Behera", "Sahoo",
    "Jena", "Samal", "Swain", "Muduli", "Lenka", "Biswal", "Parida", "Satpathy", "Mahapatra", "Kar",
    "Nanda", "Sarangi", "Rath", "Acharya", "Hota", "Praharaj", "Panigrahi", "Padhee", "Chhotray", "Dhal",
    "Harichandan", "Mangaraj", "Palei", "Ray", "Bhanja", "Mardaraj", "Singh Deo", "Bhoi", "Sethy", "Tarai",

    # East India - Assam & Northeast
    "Barua", "Saikia", "Borah", "Phukan", "Goswami", "Bezbaroa", "Kakati", "Sarma", "Hazarika", "Deka",
    "Gogoi", "Medhi", "Kalita", "Tamuly", "Chetia", "Mahanta", "Bordoloi", "Barpatragohain", "Borgohain", "Buragohain",
    "Duara", "Khandikar", "Lahkar", "Mazumdar", "Neog", "Patgiri", "Rajkhowa", "Sutradhar", "Talukdar", "Thakuria",

    # Punjab & Haryana
    "Gill", "Dhillon", "Sandhu", "Sidhu", "Grewal", "Mann", "Bajwa", "Bains", "Cheema", "Deol",
    "Randhawa", "Virk", "Brar", "Aulakh", "Sekhon", "Sohal", "Toor", "Waraich", "Chahal", "Ghuman",
    "Kahlon", "Malhi", "Pannu", "Sangha", "Shergill", "Uppal", "Atwal", "Basra", "Dhatt", "Hans",

    # Central & Marwari / Trading Communities
    "Agarwal", "Goyal", "Bansal", "Mittal", "Singhal", "Garg", "Jindal", "Goel", "Tayal", "Bindal",
    "Kansal", "Singla", "Khandelwal", "Maheshwari", "Rathi", "Mundra", "Daga", "Toshniwal", "Baheti", "Kabra",
    "Laddha", "Taparia", "Kasat", "Sikchi", "Malpani", "Sarda", "Lahoti", "Biyani", "Bangur", "Birla"
]

INDIAN_CITIES = [
    ("Bengaluru", "Karnataka", [
        "Indiranagar", "Koramangala", "Whitefield", "Jayanagar", "Malleshwaram", "HSR Layout",
        "JP Nagar", "Marathahalli", "BTM Layout", "Hebbal", "Yelahanka", "Rajajinagar", "Basavanagudi"
    ], "5600"),
    ("Mumbai", "Maharashtra", [
        "Andheri West", "Bandra West", "Dadar", "Borivali West", "Goregaon East", "Juhu",
        "Powai", "Chembur", "Ghatkopar East", "Mulund West", "Worli", "Colaba", "Kandivali East"
    ], "4000"),
    ("New Delhi", "Delhi NCR", [
        "Rohini Sector 14", "Dwarka Sector 10", "Saket", "Vasant Kunj", "Karol Bagh", "Lajpat Nagar IV",
        "Hauz Khas", "Pitampura", "Janakpuri", "Connaught Place", "Greater Kailash II", "Mayur Vihar Phase 1"
    ], "1100"),
    ("Hyderabad", "Telangana", [
        "Banjara Hills Road No 12", "Jubilee Hills", "Gachibowli", "Madhapur", "Kukatpally Housing Board",
        "Begumpet", "Ameerpet", "Secunderabad Cantonment", "Dilsukhnagar", "Hitec City", "Kondapur", "Manikonda"
    ], "5000"),
    ("Chennai", "Tamil Nadu", [
        "T. Nagar", "Anna Nagar West", "Adyar", "Mylapore", "Velachery", "Nungambakkam",
        "Thiruvanmiyur", "Besant Nagar", "Kilpauk", "Guindy", "Perambur", "Kodambakkam"
    ], "6000"),
    ("Kolkata", "West Bengal", [
        "Salt Lake Sector 3", "New Town Action Area 1", "Ballygunge Circular Road", "Alipore", "Park Street",
        "Howrah Station Road", "Behala Chowrasta", "Gariahat", "Dum Dum Cantonment", "Jadavpur Central Road"
    ], "7000"),
    ("Pune", "Maharashtra", [
        "Kothrud DP Road", "Viman Nagar", "Hinjewadi Phase 1", "Aundh", "Wakad", "Baner Road",
        "Kalyani Nagar", "Hadapsar Magarpatta", "Shivajinagar", "Pimpri-Chinchwad", "Koregaon Park"
    ], "4110"),
    ("Ahmedabad", "Gujarat", [
        "Satellite Road", "Bodakdev", "Navrangpura", "Vastrapur Lake Road", "Maninagar East",
        "Prahlad Nagar", "SG Highway", "Paldi", "Ellisbridge", "Naranpura", "Gota"
    ], "3800"),
    ("Jaipur", "Rajasthan", [
        "Malviya Nagar", "Vaishali Nagar", "Mansarovar Sector 5", "C-Scheme Ashok Nagar", "Raja Park",
        "Bani Park", "Tonk Road", "Ajmer Road", "Jagatpura", "Vidhyadhar Nagar"
    ], "3020"),
    ("Lucknow", "Uttar Pradesh", [
        "Gomti Nagar Phase 2", "Hazratganj", "Aliganj Sector B", "Indira Nagar", "Mahanagar",
        "Ashiyana Colony", "Vikas Nagar", "Jankipuram", "Alambagh", "Rajajipuram"
    ], "2260"),
    ("Chandigarh", "Punjab & Haryana", [
        "Sector 17 Commercial Complex", "Sector 35-C", "Sector 8 Inner Ring", "Sector 22 Market",
        "Sector 43 Bus Stand Road", "Sector 11", "Sector 9", "Sector 20", "Sector 34 Sub-City Centre"
    ], "1600"),
    ("Kochi", "Kerala", [
        "Panampilly Nagar", "Marine Drive", "Kaloor", "Edappally Bypass", "Kadavanthra",
        "Fort Kochi", "Aluva Town", "Thrikkakara", "Palarivattom", "Vyttila Mobility Hub"
    ], "6820"),
    ("Indore", "Madhya Pradesh", [
        "Vijay Nagar", "Palasia Old & New", "Scheme No 54", "Annapurna Road", "Bhawarkuan",
        "Geeta Bhawan", "AB Road LIG Colony", "Rajendra Nagar", "Rau Bypass", "Sapna Sangeeta Road"
    ], "4520"),
    ("Bhopal", "Madhya Pradesh", [
        "Arera Colony E-3", "MP Nagar Zone II", "Kolar Road", "Hoshangabad Road", "Shahpura",
        "Habibganj", "TT Nagar", "Govindpura Industrial Area", "Bairagarh", "Ayodhya Bypass"
    ], "4620"),
    ("Visakhapatnam", "Andhra Pradesh", [
        "MVP Colony Sector 2", "Siripuram Junction", "Madhurawada IT SEZ", "Gajuwaka", "Waltair Uplands",
        "Dwaraka Nagar", "Seethammadhara", "Rushikonda", "Maharanipeta", "Pendurthi"
    ], "5300"),
    ("Coimbatore", "Tamil Nadu", [
        "RS Puram", "Gandhipuram 7th Street", "Peelamedu Avinashi Road", "Saibaba Colony",
        "Race Course Road", "Ramanathapuram", "Saravanampatti IT Corridor", "Singanallur", "Kovaipudur"
    ], "6410"),
    ("Nagpur", "Maharashtra", [
        "Dharampeth", "Ramdaspeth Central Ave", "Civil Lines", "Pratap Nagar", "Manish Nagar",
        "Wardha Road", "Sitabuldi Market", "Bajaj Nagar", "Besur Chowk", "Khamla"
    ], "4400"),
    ("Patna", "Bihar", [
        "Boring Road Chauraha", "Kankarbagh Colony", "Bailey Road", "Rajendra Nagar", "Patliputra Colony",
        "Fraser Road Dak Bungalow", "Ashiana Nagar", "Anisabad", "Danapur Cantt", "Saguna More"
    ], "8000"),
    ("Bhubaneswar", "Odisha", [
        "Saheed Nagar", "Jayadev Vihar", "Patia Infocity Road", "Khandagiri Square", "Chandrasekharpur",
        "Nayapalli", "Old Town", "Bapuji Nagar", "Unit 4 MLA Colony", "Baramunda"
    ], "7510"),
    ("Surat", "Gujarat", [
        "Athwa Lines", "Vesu Canal Corridor", "Adajan Pal Road", "Piplod VIP Road", "City Light Road",
        "Varachha Diamond Market", "Katargam", "Rander", "Dumas Road", "Ghod Dod Road"
    ], "3950"),
    ("Vadodara", "Gujarat", [
        "Alkapuri Race Course", "Akota Stadium Road", "Fatehgunj", "Manjalpur Deep Chambers",
        "Vasna Bhayli Road", "Gotri Sevasi Canal", "Karelibaug", "Sayajigunj", "Waghodia Road"
    ], "3900"),
    ("Ludhiana", "Punjab", [
        "Model Town", "Sarabha Nagar Ferozepur Road", "Civil Lines", "BRS Nagar", "South City",
        "Mall Road", "Kitchlu Nagar", "Dugri Phase 1", "Focal Point Phase 5", "Pakhowal Road"
    ], "1410"),
    ("Amritsar", "Punjab", [
        "Ranjit Avenue B-Block", "Mall Road", "Civil Lines", "Lawrence Road", "Majitha Road",
        "Green Avenue", "Court Road", "GT Road Putligarh", "Batala Road", "Albert Road"
    ], "1430"),
    ("Varanasi", "Uttar Pradesh", [
        "Sigra Mahmoorganj", "Bhelupur", "Lanka BHU Gate", "Cantonment Mall Road", "Orderly Bazar",
        "Shivpur Bypass", "Assi Ghat Enclave", "Pandeypur", "Durgakund", "Rathyatra"
    ], "2210"),
    ("Kanpur", "Uttar Pradesh", [
        "Swaroop Nagar", "Civil Lines VIP Road", "Kakadeo Coaching Hub", "Govind Nagar", "Kidwai Nagar",
        "Sharda Nagar", "Tilak Nagar", "Barra Sector 2", "Panki Kalyanpur Road", "Arya Nagar"
    ], "2080"),
    ("Dehradun", "Uttarakhand", [
        "Rajpur Road", "Dalanwala", "Clement Town Subhash Nagar", "Chakrata Road", "Vasant Vihar Phase 2",
        "Race Course", "Sahastradhara Road", "Ballupur Chowk", "GMS Road", "Jakhan"
    ], "2480"),
    ("Guwahati", "Assam", [
        "GS Road Christian Basti", "RG Baruah Road Zoo Road", "Beltola Bazar", "Six Mile VIP Road",
        "Uzan Bazar", "Chandmari Colony", "Dispur Capital Complex", "Pan Bazar", "Jalukbari", "Ganeshguri"
    ], "7810"),
    ("Ranchi", "Jharkhand", [
        "Harmu Housing Colony", "Morabadi Ground Road", "Kanke Road", "Doranda Main Road",
        "Ashok Nagar", "Bariatu Medical College Road", "Lalpur Chowk", "Hinoo Airport Road", "Ratu Road"
    ], "8340"),
    ("Raipur", "Chhattisgarh", [
        "Shankar Nagar VIP Road", "Telibandha Marine Drive", "Devendra Nagar", "Samta Colony",
        "Pandri Commercial Complex", "Tatibandh GE Road", "Civil Lines", "Dharampura", "Kapa"
    ], "4920"),
    ("Madurai", "Tamil Nadu", [
        "KK Nagar", "Anna Nagar West", "Tallakulam Alagar Kovil Road", "SS Colony", "Villapuram",
        "Simmakkal", "Koodal Nagar", "Ellis Nagar", "Bypass Road", "Thirunagar"
    ], "6250"),
    ("Thiruvananthapuram", "Kerala", [
        "Kowdiar Palace Enclave", "Sasthamangalam", "Vellayambalam", "Pattom", "Kazhakoottam Technopark",
        "Vazhuthacaud", "Jagathy", "Peroorkada", "Kumarapuram", "Thycaud"
    ], "6950"),
    ("Mysuru", "Karnataka", [
        "Gokulam 3rd Stage", "Jayalakshmipuram", "Kuvempunagar", "Saraswathipuram", "Vijayanagar 2nd Stage",
        "Vidyaranyapuram", "Hebbal Industrial Area", "Siddhartha Layout", "Yadavagiri", "Bogadi"
    ], "5700"),
    ("Jodhpur", "Rajasthan", [
        "Shastri Nagar", "Ratanada Circuit House Road", "Sardarpura 9th C Road", "Pal Road",
        "Paota B-Road", "Basni Phase 2", "Chopasni Housing Board", "Kamla Nehru Nagar", "Airforce Area"
    ], "3420"),
    ("Vijayawada", "Andhra Pradesh", [
        "Suryaraopeta", "Governorpeta", "Moghalrajpuram Siddhartha College Road", "Labbipet",
        "Benz Circle MG Road", "Auto Nagar", "Bhavanipuram", "Patamata High School Road", "Gunadala"
    ], "5200"),
    ("Noida", "Uttar Pradesh", [
        "Sector 62 Institutional Area", "Sector 50", "Sector 18 Atta Market", "Sector 137 Expressway",
        "Sector 76 Metro Enclave", "Sector 128 Jaypee Greens", "Sector 15", "Sector 44", "Sector 93A"
    ], "2013"),
    ("Gurugram", "Haryana", [
        "DLF Phase 2 Cyber City", "DLF Phase 5 Golf Course Road", "Sushant Lok 1", "Sector 56 Metro Station",
        "South City 2 Sohna Road", "Sector 14 Old Delhi Road", "Sector 23 Palam Vihar", "Sector 48 Subhash Chowk"
    ], "1220")
]
