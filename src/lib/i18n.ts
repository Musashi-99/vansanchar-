import { useStore } from './store';

export const LANGS = [
  { code: 'en', name: 'English', native: 'English' }, { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' }, { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' }, { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' }, { code: 'raj', name: 'Rajasthani', native: 'राजस्थानी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' }, { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' }, { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }, { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
];
const LOCALE: Record<string, string> = { en: 'en-IN', bn: 'bn-IN', hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN', ml: 'ml-IN', as: 'as-IN', raj: 'hi-IN', gu: 'gu-IN', kn: 'kn-IN', te: 'te-IN', or: 'or-IN', pa: 'pa-IN', ur: 'ur-IN', ne: 'ne-NP' };
export const localeOf = (c: string) => LOCALE[c] ?? 'en-IN';

type Dict = Record<string, string>;
const en: Dict = {
  tagline: 'Bridging Communities & Wildlife',
  'nav.home': 'Home', 'nav.map': 'Map', 'nav.report': 'Report', 'nav.analytics': 'AI Analytics', 'nav.education': 'Education', 'nav.profile': 'Profile',
  'nav.more': 'More', 'hello': 'Namaste', 'sos': 'SOS',
  'home.report': 'Report Wildlife Conflict', 'home.reportSub': 'Photo · Voice · GPS', 'home.alerts': 'Recent Alerts', 'home.emergency': 'Important Emergency Numbers',
  'home.tips': 'Quick Safety Tips', 'home.weather': 'Weather & Risk', 'home.quick': 'Quick Actions',
  'form.animal': 'Animal', 'form.severity': 'Severity', 'form.description': 'Description', 'form.location': 'Location', 'form.submit': 'Submit report', 'form.time': 'When did it happen?',
  'sev.low': 'Low', 'sev.medium': 'Medium', 'sev.high': 'High', 'sev.critical': 'Critical',
  'common.call': 'Call', 'common.share': 'Share', 'common.cancel': 'Cancel', 'common.save': 'Save', 'common.back': 'Back', 'common.language': 'Language',
  'login.title': 'Welcome to VanSanchar', 'login.phone': 'Mobile number', 'login.otp': 'Enter 6-digit OTP', 'login.send': 'Send OTP', 'login.verify': 'Verify & continue',
  'sos.warn': 'Use SOS only for a genuine life-threatening emergency. Misuse delays help for others.',
  'safe.call': 'In immediate danger, call 112 first.',
};
const bn: Dict = {
  tagline: 'সম্প্রদায় ও বন্যপ্রাণীর সেতুবন্ধন',
  'nav.home': 'হোম', 'nav.map': 'মানচিত্র', 'nav.report': 'রিপোর্ট', 'nav.analytics': 'এআই বিশ্লেষণ', 'nav.education': 'শিক্ষা', 'nav.profile': 'প্রোফাইল', 'nav.more': 'আরও',
  hello: 'নমস্কার', sos: 'এসওএস',
  'home.report': 'বন্যপ্রাণী সংঘাত জানান', 'home.reportSub': 'ছবি · ভয়েস · জিপিএস', 'home.alerts': 'সাম্প্রতিক সতর্কতা', 'home.emergency': 'জরুরি নম্বর',
  'home.tips': 'দ্রুত নিরাপত্তা পরামর্শ', 'home.weather': 'আবহাওয়া ও ঝুঁকি', 'home.quick': 'দ্রুত কাজ',
  'form.animal': 'প্রাণী', 'form.severity': 'তীব্রতা', 'form.description': 'বিবরণ', 'form.location': 'অবস্থান', 'form.submit': 'রিপোর্ট জমা দিন', 'form.time': 'কখন ঘটেছিল?',
  'sev.low': 'কম', 'sev.medium': 'মাঝারি', 'sev.high': 'উচ্চ', 'sev.critical': 'সংকটজনক',
  'common.call': 'কল', 'common.share': 'শেয়ার', 'common.cancel': 'বাতিল', 'common.save': 'সংরক্ষণ', 'common.back': 'ফিরে যান', 'common.language': 'ভাষা',
  'login.title': 'ভানসঞ্চারে স্বাগতম', 'login.phone': 'মোবাইল নম্বর', 'login.otp': '৬ সংখ্যার OTP দিন', 'login.send': 'OTP পাঠান', 'login.verify': 'যাচাই করুন',
  'sos.warn': 'শুধুমাত্র প্রাণঘাতী জরুরি অবস্থায় SOS ব্যবহার করুন। অপব্যবহারে অন্যের সাহায্য দেরি হয়।',
  'safe.call': 'তাৎক্ষণিক বিপদে প্রথমে ১১২ নম্বরে কল করুন।',
};
const hi: Dict = {
  tagline: 'समुदाय और वन्यजीव के बीच सेतु',
  'nav.home': 'होम', 'nav.map': 'नक्शा', 'nav.report': 'रिपोर्ट', 'nav.analytics': 'AI विश्लेषण', 'nav.education': 'शिक्षा', 'nav.profile': 'प्रोफ़ाइल', 'nav.more': 'और',
  hello: 'नमस्ते', sos: 'एसओएस',
  'home.report': 'वन्यजीव संघर्ष की रिपोर्ट करें', 'home.reportSub': 'फ़ोटो · आवाज़ · जीपीएस', 'home.alerts': 'हाल की चेतावनियाँ', 'home.emergency': 'ज़रूरी आपातकालीन नंबर',
  'home.tips': 'त्वरित सुरक्षा सुझाव', 'home.weather': 'मौसम और जोखिम', 'home.quick': 'त्वरित कार्य',
  'form.animal': 'जानवर', 'form.severity': 'गंभीरता', 'form.description': 'विवरण', 'form.location': 'स्थान', 'form.submit': 'रिपोर्ट जमा करें', 'form.time': 'यह कब हुआ?',
  'sev.low': 'कम', 'sev.medium': 'मध्यम', 'sev.high': 'उच्च', 'sev.critical': 'गंभीर',
  'common.call': 'कॉल', 'common.share': 'साझा करें', 'common.cancel': 'रद्द करें', 'common.save': 'सहेजें', 'common.back': 'वापस', 'common.language': 'भाषा',
  'login.title': 'वनसंचार में आपका स्वागत है', 'login.phone': 'मोबाइल नंबर', 'login.otp': '6 अंकों का OTP दर्ज करें', 'login.send': 'OTP भेजें', 'login.verify': 'सत्यापित करें',
  'sos.warn': 'SOS का उपयोग केवल जानलेवा आपात स्थिति में करें। दुरुपयोग से दूसरों की मदद में देरी होती है।',
  'safe.call': 'तत्काल खतरे में पहले 112 पर कॉल करें।',
};
// Other languages: navigation + core safety strings only; remaining keys fall back to English.
const ne: Dict = { 'nav.home': 'गृह', 'nav.map': 'नक्सा', 'nav.report': 'रिपोर्ट', 'nav.education': 'शिक्षा', 'nav.profile': 'प्रोफाइल', sos: 'एसओएस' };
const mr: Dict = { 'nav.home': 'मुख्यपृष्ठ', 'nav.map': 'नकाशा', 'nav.report': 'अहवाल', 'nav.education': 'शिक्षण', 'nav.profile': 'प्रोफाइल', sos: 'एसओएस' };
const ta: Dict = { 'nav.home': 'முகப்பு', 'nav.map': 'வரைபடம்', 'nav.report': 'புகார்', 'nav.education': 'கல்வி', 'nav.profile': 'சுயவிவரம்', sos: 'அவசரம்' };
const ml: Dict = { 'nav.home': 'ഹോം', 'nav.map': 'മാപ്പ്', 'nav.report': 'റിപ്പോർട്ട്', 'nav.education': 'വിദ്യാഭ്യാസം', 'nav.profile': 'പ്രൊഫൈൽ', sos: 'എസ്ഒഎസ്' };
const as_: Dict = { 'nav.home': 'ঘৰ', 'nav.map': 'মানচিত্ৰ', 'nav.report': 'প্ৰতিবেদন', 'nav.education': 'শিক্ষা', 'nav.profile': 'প্ৰফাইল', sos: 'এছঅ’এছ' };
const gu: Dict = { 'nav.home': 'હોમ', 'nav.map': 'નકશો', 'nav.report': 'રિપોર્ટ', 'nav.education': 'શિક્ષણ', 'nav.profile': 'પ્રોફાઇલ', sos: 'એસઓએસ' };
const kn: Dict = { 'nav.home': 'ಮುಖಪುಟ', 'nav.map': 'ನಕ್ಷೆ', 'nav.report': 'ವರದಿ', 'nav.education': 'ಶಿಕ್ಷಣ', 'nav.profile': 'ಪ್ರೊಫೈಲ್', sos: 'ಎಸ್‌ಒಎಸ್' };
const te: Dict = { 'nav.home': 'హోమ్', 'nav.map': 'మ్యాప్', 'nav.report': 'నివేదిక', 'nav.education': 'విద్య', 'nav.profile': 'ప్రొఫైల్', sos: 'ఎస్ఓఎస్' };
const or: Dict = { 'nav.home': 'ହୋମ', 'nav.map': 'ମାନଚିତ୍ର', 'nav.report': 'ରିପୋର୍ଟ', 'nav.education': 'ଶିକ୍ଷା', 'nav.profile': 'ପ୍ରୋଫାଇଲ', sos: 'ଏସଓଏସ' };
const pa: Dict = { 'nav.home': 'ਹੋਮ', 'nav.map': 'ਨਕਸ਼ਾ', 'nav.report': 'ਰਿਪੋਰਟ', 'nav.education': 'ਸਿੱਖਿਆ', 'nav.profile': 'ਪ੍ਰੋਫਾਈਲ', sos: 'ਐਸਓਐਸ' };
const ur: Dict = { 'nav.home': 'ہوم', 'nav.map': 'نقشہ', 'nav.report': 'رپورٹ', 'nav.education': 'تعلیم', 'nav.profile': 'پروفائل', sos: 'ایس او ایس', 'safe.call': 'فوری خطرے میں پہلے 112 پر کال کریں۔' };
const raj: Dict = { ...hi, 'nav.map': 'नक्शो' };

const DICTS: Record<string, Dict> = { en, bn, hi, ne, mr, ta, ml, as: as_, gu, kn, te, or, pa, ur, raj };

export function useT() {
  const lang = useStore((s) => s.lang);
  const t = (k: string) => DICTS[lang]?.[k] ?? en[k] ?? k.split('.').pop()!;
  return { t, lang, locale: localeOf(lang), rtl: lang === 'ur' };
}
