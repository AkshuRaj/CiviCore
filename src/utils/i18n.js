export const SUPPORTED_LANGUAGES = ['en-IN', 'ta-IN', 'hi-IN'];

export const categories = [
  {
    id: 'Electricity',
    title: { 'en-IN': 'Electricity', 'ta-IN': 'மின்சாரம்', 'hi-IN': 'बिजली' },
    description: {
      'en-IN': 'Report power outages or wiring issues',
      'ta-IN': 'மின்விளக்கு அல்லது வயரிங் பிரச்சனைகளை அறிக்கையிடவும்',
      'hi-IN': 'बिजली कटौती या वायरिंग समस्याओं रिपोर्ट करें',
    },
  },
  {
    id: 'Water',
    title: { 'en-IN': 'Water', 'ta-IN': 'நீர்', 'hi-IN': 'पानी' },
    description: {
      'en-IN': 'Report water supply or leakage problems',
      'ta-IN': 'நீர் வழங்கல் அல்லது சிதறல் தொடர்பான பிரச்சனைகள்',
      'hi-IN': 'पानी की आपूर्ति या रिसाव की समस्याएं रिपोर्ट करें',
    },
  },
  {
    id: 'Sanitation',
    title: { 'en-IN': 'Sanitation', 'ta-IN': 'சுகாதாரம்', 'hi-IN': 'स्वच्छता' },
    description: {
      'en-IN': 'Report sanitation and public hygiene issues',
      'ta-IN': 'சுகாதார மற்றும் பொதுமக்கள் சுத்தம் தொடர்பான பிரச்சனைகள்',
      'hi-IN': 'स्वच्छता और सार्वजनिक स्वच्छता समस्याओं की रिपोर्ट करें',
    },
  },
  {
    id: 'Road Damage',
    title: { 'en-IN': 'Road Damage', 'ta-IN': 'சாலை சேதம்', 'hi-IN': 'सड़क क्षति' },
    description: {
      'en-IN': 'Report potholes or damaged roads',
      'ta-IN': 'பாதைகளின் உறவேலையாகவோ சேதமடைந்த சாலைகள்',
      'hi-IN': 'गीरोहोल या क्षतिग्रस्त सड़कों की रिपोर्ट करें',
    },
  },
  {
    id: 'Street Light',
    title: { 'en-IN': 'Street Light', 'ta-IN': 'வார்டு விளக்கு', 'hi-IN': 'स्ट्रीट लाइट' },
    description: {
      'en-IN': 'Report broken or flickering street lights',
      'ta-IN': 'மிண்ட விளக்குகள் உடைந்த அல்லது மின்னலாக்கம்',
      'hi-IN': 'टूटी हुई या झिलमिलाती स्ट्रीट लाइट्स की रिपोर्ट करें',
    },
  },
  {
    id: 'Public Safety',
    title: { 'en-IN': 'Public Safety', 'ta-IN': 'பொது பாதுகாப்பு', 'hi-IN': 'सार्वजनिक सुरक्षा' },
    description: {
      'en-IN': 'Report hazards affecting public safety',
      'ta-IN': 'பொது பாதுகாப்பை பாதிக்கும் அபாயங்களை அறிக்கையிடவும்',
      'hi-IN': 'सार्वजनिक सुरक्षा को प्रभावित करने वाले खतरों की रिपोर्ट करें',
    },
  },
  {
    id: 'Drainage',
    title: { 'en-IN': 'Drainage', 'ta-IN': 'வடிகால்', 'hi-IN': 'ड्रेनेज' },
    description: {
      'en-IN': 'Report blocked or overflowing drains',
      'ta-IN': 'மலிவு குழாய்கள் தடைக்கப்பட்டவோ overflow ஆகிவிட்டவோ',
      'hi-IN': 'अवरोधित या ओवरफ्लो हो रहे नालों की रिपोर्ट करें',
    },
  },
  {
    id: 'Others',
    title: { 'en-IN': 'Others', 'ta-IN': 'மற்றவை', 'hi-IN': 'अन्य' },
    description: {
      'en-IN': 'Report other civic issues not listed above',
      'ta-IN': 'மேலே பட்டவற்றில் இல்லாத பிற பிரச்சனைகள்',
      'hi-IN': 'ऊपर सूचीबद्ध नहीं अन्य नागरिक समस्याओं की रिपोर्ट करें',
    },
  },
];

export const numberWords = {
  'en-IN': ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'],
  'ta-IN': ['ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு'],
  'hi-IN': ['एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ'],
};

export const numberToCategoryId = {
  1: 'Electricity',
  2: 'Water',
  3: 'Sanitation',
  4: 'Road Damage',
  5: 'Street Light',
  6: 'Public Safety',
  7: 'Drainage',
  8: 'Others',
};

export function getCategoryTitle(id, lang = 'en-IN') {
  const found = categories.find((c) => c.id === id);
  return (found && (found.title[lang] || found.title['en-IN'])) || id;
}

export function getCategoryDescription(id, lang = 'en-IN') {
  const found = categories.find((c) => c.id === id);
  return (found && (found.description[lang] || found.description['en-IN'])) || '';
}

export const formLabels = {
  'en-IN': {
    heading: 'Register Complaint',
    locationHeading: 'Location Information',
    cityLabel: 'City / Area / Zone',
    cityPlaceholder: 'Select City / Area',
    streetLabel: 'Street / Locality',
    addressLabel: 'Door No / Address',
    landmarkLabel: 'Landmark',
    complaintHeading: 'Complaint Information',
    complaintTitle: 'Complaint Title',
    complaintDescription: 'Complaint Description',
    uploadProof: 'Upload Proof (image / video / audio)',
    additionalHeading: 'Additional Details',
    priorityLabel: 'Priority / Urgency',
    priorityOptions: { Normal: 'Normal', High: 'High', Emergency: 'Emergency' },
    contactTimeLabel: 'Preferred Contact Time',
    contactOptions: { Morning: 'Morning', Afternoon: 'Afternoon', Evening: 'Evening' },
    submitButton: 'Register Complaint',
    submittingButton: 'Registering…',
    selectCityOption: 'Select City / Area',
    helpWords: (count, max) => `${count} words (max ${max} words)`,
    errors: {
      city: 'City / Area is required',
      street: 'Street / Locality is required',
      address: 'Door No / Address is required',
      title: 'Complaint title is required',
      description: 'Complaint description is required',
      descriptionTooLong: (max) => `Description cannot exceed ${max} words`,
    },
    success: {
      registered: (id) => `Registered complaint successfully${id ? ' ID: ' + id : ''}`,
    },
    voicePrompts: {
      city: 'Please say the city name',
      street: 'Please say the street or locality',
      address: 'Please say the door number or address',
      landmark: 'Please say the landmark',
      name: 'Please say your name',
      title: 'Please say the complaint title',
      description: 'Please describe your complaint',
      priority: 'Please say the priority level',
      contact_time: 'Please say your preferred contact time',
    },
  },
  'ta-IN': {
    heading: 'புகார் பதிவேடு',
    locationHeading: 'இடத்தின் தகவல்',
    cityLabel: 'நகரம் / பகுதி / மண்டலம்',
    cityPlaceholder: 'நகரத்தை தேர்வு செய்க',
    streetLabel: 'தெரு / பகுதி',
    addressLabel: 'வீட்டு எண் / முகவரி',
    landmarkLabel: 'லேண்ட்மார்க்',
    complaintHeading: 'புகார் தகவல்',
    complaintTitle: 'புகாரின் தலைப்பு',
    complaintDescription: 'புகார் விவரம்',
    uploadProof: 'உதவிக்கான ஆதாரம் (படம் / வீடியோ / ஒலி)',
    additionalHeading: 'மேலதிக விவரங்கள்',
    priorityLabel: 'திறன் / அவசரம்',
    priorityOptions: { Normal: 'தரமுடைய', High: 'உயர்', Emergency: 'அவசரம்' },
    contactTimeLabel: 'தொடர்புக்கான முன்னுரிமை நேரம்',
    contactOptions: { Morning: 'காலை', Afternoon: 'மதியம்', Evening: 'மாலை' },
    submitButton: 'புகார் பதிவு செய்',
    submittingButton: 'பதிவாகி வருகிறது…',
    selectCityOption: 'நகரத்தை தேர்வு செய்க',
    helpWords: (count, max) => `${count} சொற்கள் (கூட  ${max} சொற்கள்)`,
    errors: {
      city: 'நகரம்/பகுதி ضروري',
      street: 'தெரு/பகுதி தேவை',
      address: 'முகவரி தேவை',
      title: 'புகாரின் தலைப்பு தேவை',
      description: 'புகார் விவரம் தேவை',
      descriptionTooLong: (max) => `விளக்கம் ${max} சொற்களைக் கொண்டிருக்க கூடாது`,
    },
    success: {
      registered: (id) => `புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது${id ? ' ID: ' + id : ''}`,
    },
    voicePrompts: {
      city: 'நகர பெயர் சொல்லவும்',
      street: 'தெரு அல்லது பகுதி சொல்லவும்',
      address: 'வீட்டு எண் அல்லது முகவரி சொல்லவும்',
      landmark: 'லேண்ட்மார்க் சொல்லவும்',
      name: 'உங்களின் பெயர் சொல்லவும்',
      title: 'புகாரின் தலைப்பு சொல்லவும்',
      description: 'உங்களின் புகார் விவரிக்கவும்',
      priority: 'முன்னுரிமை மட்டத்தை சொல்லவும்',
      contact_time: 'உங்கள் விரும்பிய தொடர்பு நேரத்தை சொல்லவும்',
    },
  },
  'hi-IN': {
    heading: 'शिकायत दर्ज करें',
    locationHeading: 'स्थान की जानकारी',
    cityLabel: 'शहर / क्षेत्र / ज़ोन',
    cityPlaceholder: 'शहर चुनें',
    streetLabel: 'सड़क / स्थान',
    addressLabel: 'दरवाजा नं / पता',
    landmarkLabel: 'निकटतम पहचान',
    complaintHeading: 'शिकायत जानकारी',
    complaintTitle: 'शिकायत शीर्षक',
    complaintDescription: 'शिकायत विवरण',
    uploadProof: 'प्रमाण अपलोड करें (छवि / वीडियो / ऑडियो)',
    additionalHeading: 'अतिरिक्त विवरण',
    priorityLabel: 'प्राथमिकता / तात्कालिकता',
    priorityOptions: { Normal: 'साधारण', High: 'उच्च', Emergency: 'आपातकाल' },
    contactTimeLabel: 'पसंदीदा संपर्क समय',
    contactOptions: { Morning: 'सुबह', Afternoon: 'दोपहर', Evening: 'शाम' },
    submitButton: 'शिकायत दर्ज करें',
    submittingButton: 'दर्ज किया जा रहा है…',
    selectCityOption: 'शहर चुनें',
    helpWords: (count, max) => `${count} शब्द (अधिकतम ${max} शब्द)`,
    errors: {
      city: 'शहर / क्षेत्र आवश्यक है',
      street: 'सड़क / स्थान आवश्यक है',
      address: 'पता आवश्यक है',
      title: 'शिकायत शीर्षक आवश्यक है',
      description: 'शिकायत विवरण आवश्यक है',
      descriptionTooLong: (max) => `विवरण ${max} शब्दों से अधिक नहीं होना चाहिए`,
    },
    success: {
      registered: (id) => `शिकायत सफलतापूर्वक दर्ज की गई${id ? ' ID: ' + id : ''}`,
    },
    voicePrompts: {
      city: 'कृपया शहर का नाम बताएं',
      street: 'कृपया सड़क या स्थान बताएं',
      address: 'कृपया दरवाजा नंबर या पता बताएं',
      landmark: 'कृपया निकटतम पहचान बताएं',
      name: 'कृपया अपना नाम बताएं',
      title: 'कृपया शिकायत का शीर्षक बताएं',
      description: 'कृपया अपनी शिकायत का विवरण दें',
      priority: 'कृपया प्राथमिकता स्तर बताएं',
      contact_time: 'कृपया अपना पसंदीदा संपर्क समय बताएं',
    },
  },
};

export function getFormLabel(key, lang = 'en-IN') {
  const labels = formLabels[lang] || formLabels['en-IN'];
  return labels[key];
}

export default {
  categories,
  numberWords,
  numberToCategoryId,
  getCategoryTitle,
  getCategoryDescription,
  formLabels,
  getFormLabel,
};