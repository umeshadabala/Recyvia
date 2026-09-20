import { Language } from '../types';

export interface LocalizedRateText {
  name: string;
  description: string;
}

export const RATE_TRANSLATIONS: Record<string, Record<Language, LocalizedRateText>> = {
  'rate-ewaste-pcb': {
    en: {
      name: 'Printed Circuit Boards (PCBs / Motherboards)',
      description: 'High-grade computer motherboards, RAM, server cards, and telecom PCBs.',
    },
    hi: {
      name: 'प्रिंटेड सर्किट बोर्ड (पीसीबी / मदरबोर्ड)',
      description: 'उच्च श्रेणी के कंप्यूटर मदरबोर्ड, रैम, सर्वर कार्ड और टेलीकॉम पीसीबी।',
    },
    kn: {
      name: 'ಪ್ರಿಂಟೆಡ್ ಸರ್ಕ್ಯೂಟ್ ಬೋರ್ಡ್‌ಗಳು (PCBs / ಮದರ್‌ಬೋರ್ಡ್‌ಗಳು)',
      description: 'ಉನ್ನತ ದರ್ಜೆಯ ಕಂಪ್ಯೂಟರ್ ಮದರ್‌ಬೋರ್ಡ್‌ಗಳು, RAM, ಸರ್ವರ್ ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ಟೆಲಿಕಾಂ PCBಗಳು.',
    },
    ta: {
      name: 'அச்சிடப்பட்ட மின்சுற்றுப் பலகைகள் (PCBs / மதர்போர்டுகள்)',
      description: 'உயர் தர கணினி மதர்போர்டுகள், ரேம், சர்வர் கார்டுகள் மற்றும் தொலைத்தொடர்பு பிசிபிக்கள்.',
    },
    te: {
      name: 'ప్రింటెడ్ సర్క్యూట్ బోర్డులు (PCBs / మదర్‌బోర్డులు)',
      description: 'అధిక నాణ్యత గల కంప్యూటర్ మదర్‌బోర్డులు, RAM, సర్వర్ కార్డులు మరియు టెలికామ్ PCBs.',
    },
    mr: {
      name: 'प्रिंटेड सर्किट बोर्ड (PCBs / मदरबोर्ड)',
      description: 'उच्च दर्जाचे संगणक मदरबोर्ड, रॅम, सर्व्हर कार्ड आणि टेलिकॉम पीसीबी.',
    },
    bn: {
      name: 'প্রিন্টেড সার্কিট বোর্ড (PCBs / মাদারবোর্ড)',
      description: 'উচ্চ মানের কম্পিউটার মাদারবোর্ড, র‍্যাম, সার্ভার কার্ড এবং টেলিকম পিসিবি।',
    },
  },
  'rate-ewaste-laptops': {
    en: {
      name: 'Old Laptops & Computers (Intact)',
      description: 'Laptops, desktop CPUs, monitors, and networking switches.',
    },
    hi: {
      name: 'पुराने लैपटॉप और कंप्यूटर (अखंड)',
      description: 'लैपटॉप, डेस्कटॉप सीपीयू, मॉनिटर और नेटवर्किंग स्विच।',
    },
    kn: {
      name: 'ಹಳೆಯ ಲ್ಯಾಪ್‌ಟಾಪ್‌ಗಳು ಮತ್ತು ಕಂಪ್ಯೂಟರ್‌ಗಳು',
      description: 'ಲ್ಯಾಪ್‌ಟಾಪ್‌ಗಳು, ಡೆಸ್ಕ್‌ಟಾಪ್ CPUಗಳು, ಮಾನಿಟರ್‌ಗಳು ಮತ್ತು ನೆಟ್‌ವರ್ಕಿಂಗ್ ಸ್ವಿಚ್‌ಗಳು.',
    },
    ta: {
      name: 'பழைய மடிக்கணினிகள் மற்றும் கணினிகள்',
      description: 'மடிக்கணினிகள், டெஸ்க்டாப் சிபியு, மானிட்டர்கள் மற்றும் நெட்வொர்க்கிங் சுவிட்சுகள்.',
    },
    te: {
      name: 'పాత ల్యాప్‌టాప్‌లు మరియు కంప్యూటర్లు (అఖండంగా)',
      description: 'ల్యాప్‌టాప్‌లు, డెస్క్‌టాప్ CPUలు, మానిటర్లు మరియు నెట్‌వర్కింగ్ స్విచ్‌లు.',
    },
    mr: {
      name: 'जुने लॅपटॉप आणि संगणक',
      description: 'लॅपटॉप, डेस्कटॉप सीपीयू, मॉनिटर्स आणि नेटवर्किंग स्विचेस.',
    },
    bn: {
      name: 'পুরানো ল্যাপটপ এবং কম্পিউটার',
      description: 'ল্যাপটপ, ডেসktop সিপিইউ, মনিটর এবং নেটওয়ার্কিং সুইচ।',
    },
  },
  'rate-ewaste-phones': {
    en: {
      name: 'Smartphones & Tablets',
      description: 'Used/broken mobile phones, tablets, smartwatches, and chargers.',
    },
    hi: {
      name: 'स्मार्टफोन और टैबलेट',
      description: 'इस्तेमाल किए गए/टूटे मोबाइल फोन, टैबलेट, स्मार्टवॉच और चार्जर।',
    },
    kn: {
      name: 'ಸ್ಮಾರ್ಟ್‌ಫೋನ್‌ಗಳು ಮತ್ತು ಟ್ಯಾಬ್ಲೆಟ್‌ಗಳು',
      description: 'ಬಳಸಿದ/ಮುರಿದ ಮೊಬೈಲ್ ಫೋನ್‌ಗಳು, ಟ್ಯಾಬ್ಲೆಟ್‌ಗಳು ಮತ್ತು ಚಾರ್ಜರ್‌ಗಳು.',
    },
    ta: {
      name: 'ஸ்மார்ட்போன்கள் மற்றும் டேப்லெட்டுகள்',
      description: 'பயன்படுத்தப்பட்ட மொபைல் போன்கள், டேப்லெட்டுகள் மற்றும் சார்ஜர்கள்.',
    },
    te: {
      name: 'స్మార్ట్‌ఫోన్లు మరియు టాబ్లెట్లు',
      description: 'వాడిన/విరిగిన మొబైల్ ఫోన్లు, టాబ్లెట్లు, స్మార్ట్‌వాచ్‌లు మరియు ఛార్జర్లు.',
    },
    mr: {
      name: 'स्मार्टफोन आणि टॅब्लेट',
      description: 'वापरलेले/मोडलेले मोबाईल, टॅब्लेट, स्मार्टवॉच आणि चार्जर.',
    },
    bn: {
      name: 'স্মার্টফোন এবং ট্যাবলেট',
      description: 'ব্যবহৃত/ভাঙা মোবাইল ফোন, ট্যাবলেট, স্মার্টওয়াচ এবং চার্জার।',
    },
  },
  'rate-metal-copper': {
    en: {
      name: 'Heavy Copper Scrap (Armature & Wire)',
      description: 'Stripped copper wire, motor armatures, copper pipes, and transformer coils.',
    },
    hi: {
      name: 'भारी तांबा स्क्रैप (आर्मेचर और तार)',
      description: 'छिला हुआ तांबे का तार, मोटर आर्मेचर, तांबे के पाइप और ट्रांसफॉर्मर कॉइल।',
    },
    kn: {
      name: 'ಭಾರಿ ತಾಮ್ರದ ಸ್ಕ್ರ್ಯಾಪ್ (ಆರ್ಮೇಚರ್ ಮತ್ತು ವೈರ್)',
      description: 'ಸುಲಿದ ತಾಮ್ರದ ವೈರ್, ಮೋಟಾರ್ ಆರ್ಮೇಚರ್‌ಗಳು, ತಾಮ್ರದ ಪೈಪ್‌ಗಳು ಮತ್ತು ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ಕಾಯಿಲ್‌ಗಳು.',
    },
    ta: {
      name: 'கனமான தாமிரக் கழிவு (ஆர்மேச்சர் மற்றும் கம்பி)',
      description: 'உரிக்கப்பட்ட தாமிரக் கம்பி, மோட்டார் ஆர்மேச்சர்கள், தாமிரக் குழாய்கள் மற்றும் டிரான்ஸ்ஃபார்மர் சுருள்கள்.',
    },
    te: {
      name: 'హెవీ కాపర్ స్క్రాప్ (ఆర్మేచర్ మరియు వైర్)',
      description: 'స్ట్రిప్ చేసిన కాపర్ వైర్, మోటార్ ఆర్మేచర్లు, కాపర్ పైపులు మరియు ట్రాన్స్‌ఫార్మర్ కాయిల్స్.',
    },
    mr: {
      name: 'जड तांबे स्क्रॅप (आर्मेचर आणि वायर)',
      description: 'सोललेली तांब्याची वायर, मोटर आर्मेचर, तांब्याचे पाईप्स आणि ट्रान्सफॉर्मर कॉइल्स.',
    },
    bn: {
      name: 'ভারী তামার স্ক্র্যাপ (আর্মেচার এবং তার)',
      description: 'খোলা তামার তার, মোটর আর্মেচার, তামার পাইপ এবং ট্রান্সফরমার কয়েল।',
    },
  },
  'rate-metal-brass': {
    en: {
      name: 'Brass Fittings & Utensils',
      description: 'Brass taps, valves, hardware, musical instruments, and traditional utensils.',
    },
    hi: {
      name: 'पीतल के सामान और बर्तन',
      description: 'पीतल के नल, वाल्व, हार्डवेयर, संगीत वाद्ययंत्र और पारंपरिक बर्तन।',
    },
    kn: {
      name: 'ಹಿತ್ತಾಳೆಯ ಫಿಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ಪಾತ್ರೆಗಳು',
      description: 'ಹಿತ್ತಾಳೆಯ ನಲ್ಲಿಗಳು, ವಾಲ್ವ್‌ಗಳು, ಹಾರ್ಡ್‌ವೇರ್ ಮತ್ತು ಪಾರಂಪರಿಕ ಪಾತ್ರೆಗಳು.',
    },
    ta: {
      name: 'பித்தளை உபகரணங்கள் மற்றும் பாத்திரங்கள்',
      description: 'பித்தளை குழாய்கள், வால்வுகள், வன்பொருள் மற்றும் பாரம்பரிய பாத்திரங்கள்.',
    },
    te: {
      name: 'ఇత్తడి ఫిట్టింగులు మరియు పాత్రలు',
      description: 'ఇత్తడి ట్యాప్‌లు, వాల్వ్‌లు, హార్డ్‌వేర్ మరియు సంప్రదాయ పాత్రలు.',
    },
    mr: {
      name: 'पितळेचे सामान आणि भांडी',
      description: 'पितळी नळ, व्हॉल्व्ह, हार्डवेअर आणि पारंपारिक भांडी.',
    },
    bn: {
      name: 'পিতলের জিনিসপত্র এবং থালাবাসন',
      description: 'পিতলের কল, ভালভ, হার্ডওয়্যার এবং ঐতিহ্যবাহী জিনিসপত্র।',
    },
  },
  'rate-metal-aluminum': {
    en: {
      name: 'Aluminum Cans & Profiles',
      description: 'Beverage cans, window frames, aluminum sheets, and engine casings.',
    },
    hi: {
      name: 'एल्यूमीनियम के डिब्बे और प्रोफाइल',
      description: 'पेय के डिब्बे, खिड़की के फ्रेम, एल्यूमीनियम शीट और इंजन आवरण।',
    },
    kn: {
      name: 'ಅಲ್ಯೂಮಿನಿಯಂ ಕ್ಯಾನ್‌ಗಳು ಮತ್ತು ಪ್ರೊಫೈಲ್‌ಗಳು',
      description: 'ಪಾನೀಯ ಕ್ಯಾನ್‌ಗಳು, ಕಿಟಕಿ ಫ್ರೇಮ್‌ಗಳು, ಅಲ್ಯೂಮಿನಿಯಂ ಶೀಟ್‌ಗಳು ಮತ್ತು ಇಂಜಿನ್ ಕೇಸಿಂಗ್‌ಗಳು.',
    },
    ta: {
      name: 'அலுமினிய கேன்கள் மற்றும் சுயவிவரங்கள்',
      description: 'பானக் கேன்கள், ஜன்னல் சட்டங்கள், அலுமினியத் தாள்கள் மற்றும் என்ஜின் உறை.',
    },
    te: {
      name: 'అల్యూమినియం క్యాన్‌లు మరియు ప్రొఫైల్స్',
      description: 'పానీయాల క్యాన్‌లు, విండో ఫ్రేమ్‌లు, అల్యూమినియం షీట్లు మరియు ఇంజిన్ కేసింగ్‌లు.',
    },
    mr: {
      name: 'ॲल्युमिनियम कॅन्स आणि प्रोफाईल्स',
      description: 'पेयांचे डबे, खिडकीचे फ्रेम, ॲल्युमिनियमचे पत्रे आणि इंजिन केसिंग.',
    },
    bn: {
      name: 'অ্যালুমিনিয়াম ক্যান এবং প্রোফাইল',
      description: 'পানীয়ের ক্যান, জানালার ফ্রেম, অ্যালুমিনিয়াম শিট এবং ইঞ্জিন কেসিং।',
    },
  },
  'rate-metal-iron': {
    en: {
      name: 'Heavy Iron & Steel Scrap',
      description: 'Construction steel, TMT bars, cast iron, machine bodies, and beams.',
    },
    hi: {
      name: 'भारी लोहा और स्टील स्क्रैप',
      description: 'निर्माण स्टील, टीएमटी बार, कच्चा लोहा, मशीन बॉडी और बीम।',
    },
    kn: {
      name: 'ಭಾರಿ ಕಬ್ಬಿನ ಮತ್ತು ಸ್ಟೀಲ್ ಸ್ಕ್ರ್ಯಾಪ್',
      description: 'ಕಟ್ಟಡ ನಿರ್ಮಾಣದ ಸ್ಟೀಲ್, TMT ಬಾರ್‌ಗಳು, ಪಾಕದ ಕಬ್ಬಿನ ಮತ್ತು ಯಂತ್ರಗಳ ಬಾಡಿಗಳು.',
    },
    ta: {
      name: 'கனமான இரும்பு மற்றும் எஃகு கழிவு',
      description: 'கட்டுமான எஃகு, டிஎம்டி கம்பிகள், வார்ப்பிரும்பு, இயந்திர உடல்கள் மற்றும் விட்டங்கள்.',
    },
    te: {
      name: 'హెవీ ఐరన్ మరియు స్టీల్ స్క్రాప్',
      description: 'నిర్మాణ స్టీల్, TMT బార్లు, తారా ఇనుము, మెషిన్ బాడీలు మరియు బీమ్‌లు.',
    },
    mr: {
      name: 'जड लोखंड आणि स्टील स्क्रॅप',
      description: 'बांधकाम स्टील, टीएमटी बार, बीड लोखंड, मशीन बॉडीज आणि बीम.',
    },
    bn: {
      name: 'ভারী লোহা এবং স্টিলের স্ক্র্যাপ',
      description: 'নির্মাণ স্টিল, টিএমটি বার, ঢালাই লোহা, মেশিনের বডি এবং বিম।',
    },
  },
  'rate-paper-office': {
    en: {
      name: 'White Office Paper & Documents',
      description: 'Clean printer paper, shredded office documents, files, and letterheads.',
    },
    hi: {
      name: 'सफेद कार्यालय का कागज और दस्तावेज',
      description: 'साफ प्रिंटर पेपर, कटा हुआ कार्यालय दस्तावेज, फाइलें और लेटरहेड।',
    },
    kn: {
      name: 'ಬಿಳಿ ಕಚೇರಿ ಕಾಗದ ಮತ್ತು ದಾಖಲೆಗಳು',
      description: 'ಶುದ್ಧ ಪ್ರಿಂಟರ್ ಕಾಗದ, ಕತ್ತರಿಸಿದ ಕಚೇರಿ ದಾಖಲೆಗಳು, ಫೈಲ್‌ಗಳು ಮತ್ತು ಲೆಟರ್‌ಹೆಡ್‌ಗಳು.',
    },
    ta: {
      name: 'வெள்ளை அலுவலகக் காகிதம் மற்றும் ஆவணங்கள்',
      description: 'சுத்தமான பிரிண்டர் காகிதம், கிழிக்கப்பட்ட அலுவலக ஆவணங்கள், கோப்புகள் மற்றும் லெட்டர்ஹெட்கள்.',
    },
    te: {
      name: 'తెల్లటి ఆఫీసు కాగితం మరియు పత్రాలు',
      description: 'పరిశుభ్రమైన ప్రింటర్ కాగితం, తురుమబడిన ఆఫీసు పత్రాలు, ఫైళ్లు మరియు లెటర్‌హెడ్‌లు.',
    },
    mr: {
      name: 'पांढरा ऑफिस कागद आणि कागदपत्रे',
      description: 'स्वच्छ प्रिंटर कागद, फाडलेली ऑफिस कागदपत्रे, फाइल्स आणि लेटरहेड्स.',
    },
    bn: {
      name: 'সাদা অফিসের কাগজ এবং নথি',
      description: 'পরিষ্কার প্রিন্টার পেপার, কাটা অফিসের নথি, ফাইল এবং লেটারহেড।',
    },
  },
  'rate-paper-newspaper': {
    en: {
      name: 'Old Newspapers & Periodicals',
      description: 'Daily newspapers, magazines, flyers, and printed newsprint.',
    },
    hi: {
      name: 'पुराने समाचार पत्र और पत्रिकाएं',
      description: 'दैनिक समाचार पत्र, पत्रिकाओं, फ़्लायर्स और मुद्रित न्यूज़प्रिंट।',
    },
    kn: {
      name: 'ಹಳೆಯ ದಿನಪತ್ರಿಕೆಗಳು ಮತ್ತು ನಿಯತಕಾಲಿಕೆಗಳು',
      description: 'ದೈನಂದಿನ ಪತ್ರಿಕೆಗಳು, ನಿಯತಕಾಲಿಕಗಳು ಮತ್ತು ಮುದ್ರಿತ ಕಾಗದಗಳು.',
    },
    ta: {
      name: 'பழைய செய்தித்தாள்கள் மற்றும் இதழ்கள்',
      description: 'தினசரி செய்தித்தாள்கள், இதழ்கள் மற்றும் அச்சிடப்பட்ட தாள்கள்.',
    },
    te: {
      name: 'పాత దినపత్రికలు మరియు వారపత్రికలు',
      description: 'దినపత్రికలు, మ్యాగజైన్లు మరియు ప్రింట్ చేసిన న్యూస్‌ప్రింట్.',
    },
    mr: {
      name: 'जुनी वर्तमानपत्रे आणि नियतकालिके',
      description: 'दैनंदिन वर्तमानपत्रे, मासिके आणि छापलेले कागद.',
    },
    bn: {
      name: 'পুরানো সংবাদপত্র এবং সাময়িকী',
      description: 'দৈনিক সংবাদপত্র, ম্যাগাজিন এবং মুদ্রিত নিউজপ্রিন্ট।',
    },
  },
  'rate-cardboard-boxes': {
    en: {
      name: 'Corrugated Cardboard Boxes (Cartoon)',
      description: 'E-commerce delivery boxes, shipping packaging, and corrugated board.',
    },
    hi: {
      name: 'नालीदार कार्डबोर्ड बक्से (कार्टन)',
      description: 'ई-कॉमर्स डिलीवरी बक्से, शिपिंग पैकेजिंग और नालीदार बोर्ड।',
    },
    kn: {
      name: 'ಕೊರುಗೆಟೆಡ್ ಕಾರ್ಡ್‌ಬೋರ್ಡ್ ಬಾಕ್ಸ್‌ಗಳು (ಕಾರ್ಟನ್)',
      description: 'ಇ-ಕಾಮರ್ಸ್ ಡೆಲಿವರಿ ಬಾಕ್ಸ್‌ಗಳು ಮತ್ತು ಶಿಪಿಂಗ್ ಪ್ಯಾಕೇಜಿಂಗ್.',
    },
    ta: {
      name: 'கார்டோன் பெட்டிகள் (கார்ட்டூன்)',
      description: 'இ-காமர்ஸ் விநியோக பெட்டிகள் மற்றும் பேக்கேஜிங்.',
    },
    te: {
      name: 'కారూగేటెడ్ కార్డ్‌బోర్డ్ బాక్స్‌లు (కార్టన్)',
      description: 'ఈ-కామర్స్ డెలివరీ బాక్స్‌లు మరియు షిప్పింగ్ ప్యాకేజింగ్.',
    },
    mr: {
      name: 'पुठ्ठ्याचे बॉक्स (कार्टन)',
      description: 'ई-कॉमर्स डिलिव्हरी बॉक्स आणि पॅकेजिंग पुठ्ठा.',
    },
    bn: {
      name: 'কার্ডবোর্ড বাক্স (কার্টন)',
      description: 'ই-কমার্স ডেলিভারি বক্স এবং শিপিং প্যাকেজিং।',
    },
  },
  'rate-plastic-pet': {
    en: {
      name: 'PET Water & Beverage Bottles',
      description: 'Transparent plastic soda bottles, mineral water bottles, and clear PET containers.',
    },
    hi: {
      name: 'पीईटी पानी और पेय की बोतलें',
      description: 'पारदर्शी प्लास्टिक सोडा की बोतलें, मिनरल वाटर की बोतलें और साफ पीईटी कंटेनर।',
    },
    kn: {
      name: 'PET ನೀರು ಮತ್ತು ಪಾನೀಯ ಬಾಟಲಿಗಳು',
      description: 'ಪಾರದರ್ಶಕ ಪ್ಲಾಸ್ಟಿಕ್ ಸೋಡಾ ಬಾಟಲಿಗಳು, ಮಿನರಲ್ ವಾಟರ್ ಬಾಟಲಿಗಳು.',
    },
    ta: {
      name: 'PET தண்ணீர் மற்றும் பான பாட்டில்கள்',
      description: 'வெளிப்படையான பிளாஸ்டிக் பாட்டில்கள் மற்றும் தண்ணீர் பாட்டில்கள்.',
    },
    te: {
      name: 'PET నీరు మరియు పానీయాల బాటిళ్లు',
      description: 'పారదర్శక ప్లాస్టిక్ సోడా బాటిళ్లు మరియు మినరಲ್ వాటర్ బాటిళ్లు.',
    },
    mr: {
      name: 'PET पाण्याच्या आणि पेयांच्या बाटल्या',
      description: 'पारदर्शक प्लास्टिक सोड्याच्या बाटल्या आणि पाण्याच्या बाटल्या.',
    },
    bn: {
      name: 'পিইটি জল এবং পানীয়ের বোতল',
      description: 'স্বচ্ছ প্লাস্টিক সোডা বোতল এবং মিনারেল ওয়াটার বোতল।',
    },
  },
  'rate-plastic-hdpe': {
    en: {
      name: 'HDPE Containers & Milk Jugs',
      description: 'Detergent bottles, shampoo containers, oil cans, and rigid HDPE buckets.',
    },
    hi: {
      name: 'एचडीपीई कंटेनर और दूध के जग',
      description: 'डिटर्जेंट की बोतलें, शैम्पू के डिब्बे, तेल के डिब्बे और एचडीपीई बाल्टी।',
    },
    kn: {
      name: 'HDPE ಕಂಟೈನರ್‌ಗಳು ಮತ್ತು ಹಾಲಿನ ಜಗ್‌ಗಳು',
      description: 'ಡಿಟರ್ಜೆಂಟ್ ಬಾಟಲಿಗಳು, ಶಾಂಪೂ ಕಂಟೈನರ್‌ಗಳು ಮತ್ತು ಎಣ್ಣೆ ಕ್ಯಾನ್‌ಗಳು.',
    },
    ta: {
      name: 'HDPE கொள்கலன்கள் மற்றும் பால் ஜாடிகள்',
      description: 'துப்புரவு பாட்டில்கள், ஷாம்பு பாட்டில்கள் மற்றும் எண்ணெய் கேன்கள்.',
    },
    te: {
      name: 'HDPE కంటైనర్లు మరియు పాలు జగ్గులు',
      description: 'డిటర్జెంట్ బాటిళ్లు, షాంపూ బాటిళ్లు మరియు నూనె క్యాన్‌లు.',
    },
    mr: {
      name: 'HDPE कंटेनर्स आणि दुधाचे जार',
      description: 'डिटर्जंट बाटल्या, शॅम्पू बाटल्या आणि तेलाचे डबे.',
    },
    bn: {
      name: 'এইচডিপিই কনটেইনার এবং দুধের জগ',
      description: 'ডিটারজেন্ট বোতল, শ্যাম্পু বোতল এবং তেলের ক্যান।',
    },
  },
  'rate-batteries-lead': {
    en: {
      name: 'Lead-Acid Inverter & Auto Batteries',
      description: 'Heavy car batteries, UPS inverter batteries, and solar energy storage units.',
    },
    hi: {
      name: 'लेड-एसिड इन्वर्टर और ऑटो बैटरी',
      description: 'भारी कार बैटरी, यूपीएस इन्वर्टर बैटरी और सौर ऊर्जा भंडारण इकाइयां।',
    },
    kn: {
      name: 'ಲೆಡ್-ಆಸಿಡ್ ಇನ್ವರ್ಟರ್ ಮತ್ತು ಆಟೋ ಬ್ಯಾಟರಿಗಳು',
      description: 'ಭಾರಿ ಕಾರು ಬ್ಯಾಟರಿಗಳು, UPS ಇನ್ವರ್ಟರ್ ಬ್ಯಾಟರಿಗಳು.',
    },
    ta: {
      name: 'லெட்-ஆசிட் இன்வெர்ட்டர் மற்றும் ஆட்டோ பேட்டரிகள்',
      description: 'கனமான கார் பேட்டரிகள், யுபிஎஸ் இன்வெர்ட்டர் பேட்டரிகள்.',
    },
    te: {
      name: 'లెడ్-యాసిడ్ ఇన్వర్టర్ మరియు ఆటో బ్యాటరీలు',
      description: 'హెవీ కార్ బ్యాటరీలు, UPS ఇన్వర్టర్ బ్యాటరీలు.',
    },
    mr: {
      name: 'लेड-ॲसिड इनव्हर्टर आणि ऑटो बॅटरी',
      description: 'जड कार बॅटरी, यूपीएस इनव्हर्टर बॅटरी.',
    },
    bn: {
      name: 'লেড-অ্যাসিড ইনভার্টার এবং অটো ব্যাটারি',
      description: 'ভারী কার ব্যাটারি, ইউপিএস ইনভার্টার ব্যাটারি।',
    },
  },
  'rate-appliances-fridge': {
    en: {
      name: 'Refrigerators & Air Conditioners',
      description: 'Single/double door fridges, split AC outdoor units, and compressors.',
    },
    hi: {
      name: 'रेफ्रिजरेटर और एयर कंडीशनर',
      description: 'सिंगल/डबल डोर फ्रिज, स्प्लिट एसी आउटडोर यूनिट और कंप्रेसर।',
    },
    kn: {
      name: 'ರೆಫ್ರಿಜರೇಟರ್‌ಗಳು ಮತ್ತು ಏರ್ ಕಂಡಿಷನರ್‌ಗಳು',
      description: 'ಸಿಂಗಲ್/ಡಬಲ್ ಡೋರ್ ಫ್ರಿಡ್ಜ್‌ಗಳು, ಸ್ಪ್ಲಿಟ್ ಎಸಿ ಯೂನಿಟ್‌ಗಳು.',
    },
    ta: {
      name: 'குளிர்சாதனப் பெட்டிகள் மற்றும் ஏர் கண்டிஷனர்கள்',
      description: 'குளிர்சாதனப் பெட்டிகள், ஏசி வெளிப்புற அலகுகள்.',
    },
    te: {
      name: 'రిఫ్రిజిరేటర్లు మరియు ఎయిర్ కండిషనర్లు',
      description: 'సింగిల్/డబుల్ డోర్ ఫ్రిజ్‌లు, స్ప్లిట్ ఏసీ అవుట్‌డోర్ యూనిట్లు.',
    },
    mr: {
      name: 'रेफ्रिजरेटर आणि एअर कंडिशनर',
      description: 'फ्रिज, स्प्लिट एसी आऊटडोअर युनिट्स.',
    },
    bn: {
      name: 'রেফ্রিজারেটর এবং এয়ার কন্ডিশনার',
      description: 'ফ্রিজ, স্প্লিট এসি আউটডোর ইউনিট।',
    },
  },
};

export const TREND_TRANSLATIONS: Record<'up' | 'down' | 'stable', Record<Language, string>> = {
  up: {
    en: '↑ Rising',
    hi: '↑ बढ़ रहा है',
    kn: '↑ ಏರಿಕೆಯಲ್ಲಿದೆ',
    ta: '↑ உயர்கிறது',
    te: '↑ పెరుగుతోంది',
    mr: '↑ वाढत आहे',
    bn: '↑ বাড়ছে',
  },
  stable: {
    en: 'Stable',
    hi: 'स्थिर',
    kn: 'ಸ್ಥಿರವಾಗಿದೆ',
    ta: 'நிலையானது',
    te: 'స్థిరంగా ఉంది',
    mr: 'स्थिर',
    bn: 'স্থির',
  },
  down: {
    en: '↓ Falling',
    hi: '↓ घट रहा है',
    kn: '↓ ಇಳಿಕೆಯಲ್ಲಿದೆ',
    ta: '↓ குறைகிறது',
    te: '↓ తగ్గుతోంది',
    mr: '↓ घटत आहे',
    bn: '↓ কমছে',
  },
};

export function getLocalizedWasteItem(rateId: string, defaultName: string, defaultDesc: string, lang: Language): LocalizedRateText {
  const translationsForItem = RATE_TRANSLATIONS[rateId];
  if (translationsForItem && translationsForItem[lang]) {
    return translationsForItem[lang];
  }
  return { name: defaultName, description: defaultDesc };
}

export function getLocalizedTrend(trend: 'up' | 'down' | 'stable', lang: Language): string {
  if (TREND_TRANSLATIONS[trend] && TREND_TRANSLATIONS[trend][lang]) {
    return TREND_TRANSLATIONS[trend][lang];
  }
  return trend === 'up' ? '↑ Rising' : trend === 'down' ? '↓ Falling' : 'Stable';
}
