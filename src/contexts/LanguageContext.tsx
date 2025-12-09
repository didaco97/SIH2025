"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'mr' | 'gu';

type Translations = {
    [key in Language]: {
        [key: string]: string;
    };
};

const translations: Translations = {
    en: {
        "dashboard.farmer": "Farmer Dashboard",
        "dashboard.officer": "Officer Dashboard",
        "farmer.name": "Farmer:",
        "farmer.village": "Village:",
        "farmer.season": "Season:",
        "farmer.crop": "Crop:",
        "btn.file_claim": "File Claim",
        "section.farm_info": "Farm Information",
        "section.claims": "Claims Management",
        "section.resources": "Resources / Support",
        "card.land_area": "Land Area:",
        "card.crop_type": "Crop Type:",
        "card.sowing_date": "Sowing Date:",
        "card.district": "District / Taluka / Village:",
        "tab.file_new": "File New Claim",
        "tab.history": "Claim Status & History",
        "claim.pending": "Pending claims",
        "claim.waiting": "Waiting for approval",
        "claim.approved": "Approved claims",
        "claim.rejected": "Rejected claims",
        "resource.chatbot": "Chatbot for help",
        "resource.guidelines": "PMFBY guidelines link",
        "resource.documents": "Previous claims documents",
        "resource.download": "download",
        "officer.name": "Officer:",
        "officer.district": "District:",
        "stat.moisture": "Soil Moisture:",
        "stat.ndvi": "NDVI Score:",
        "stat.weather": "Weather Summary:",
    },
    hi: {
        "dashboard.farmer": "किसान डैशबोर्ड",
        "dashboard.officer": "अधिकारी डैशबोर्ड",
        "farmer.name": "किसान:",
        "farmer.village": "गाँव:",
        "farmer.season": "मौसम:",
        "farmer.crop": "फसल:",
        "btn.file_claim": "दावा दायर करें",
        "section.farm_info": "खेत की जानकारी",
        "section.claims": "दावा प्रबंधन",
        "section.resources": "संसाधन / सहायता",
        "card.land_area": "भूमि क्षेत्र:",
        "card.crop_type": "फसल का प्रकार:",
        "card.sowing_date": "बुवाई की तारीख:",
        "card.district": "जिला / तालुका / गाँव:",
        "tab.file_new": "नया दावा दायर करें",
        "tab.history": "दावा स्थिति और इतिहास",
        "claim.pending": "लंबित दावे",
        "claim.waiting": "अनुमोदन की प्रतीक्षा",
        "claim.approved": "स्वीकृत दावे",
        "claim.rejected": "अस्वीकृत दावे",
        "resource.chatbot": "सहायता के लिए चैटबॉट",
        "resource.guidelines": "पीएमएफबीवाई दिशानिर्देश",
        "resource.documents": "पिछले दावों के दस्तावेज",
        "resource.download": "डाउनलोड",
        "officer.name": "अधिकारी:",
        "officer.district": "जिला:",
        "stat.moisture": "मिट्टी की नमी:",
        "stat.ndvi": "NDVI स्कोर:",
        "stat.weather": "मौसम का सारांश:",
    },
    mr: {
        "dashboard.farmer": "शेतकरी डॅशबोर्ड",
        "dashboard.officer": "अधिकारी डॅशबोर्ड",
        "farmer.name": "शेतकरी:",
        "farmer.village": "गाव:",
        "farmer.season": "हंगाम:",
        "farmer.crop": "पीक:",
        "btn.file_claim": "दावा दाखल करा",
        "section.farm_info": "शेतीची माहिती",
        "section.claims": "दावा व्यवस्थापन",
        "section.resources": "संसाधने / मदत",
        "card.land_area": "जमीन क्षेत्र:",
        "card.crop_type": "पिकाचा प्रकार:",
        "card.sowing_date": "पेरणीची तारीख:",
        "card.district": "जिल्हा / तालुका / गाव:",
        "tab.file_new": "नवीन दावा दाखल करा",
        "tab.history": "दावा स्थिती आणि इतिहास",
        "claim.pending": "प्रलंबित दावे",
        "claim.waiting": "मंजूरीच्या प्रतीक्षेत",
        "claim.approved": "मंजूर दावे",
        "claim.rejected": "नाकारलेले दावे",
        "resource.chatbot": "मदतीसाठी चॅटबॉट",
        "resource.guidelines": "PMFBY मार्गदर्शक तत्त्वे",
        "resource.documents": "मागील दाव्यांची कागदपत्रे",
        "resource.download": "डाउनलोड",
        "officer.name": "अधिकारी:",
        "officer.district": "जिल्हा:",
        "stat.moisture": "मातीची आर्द्रता:",
        "stat.ndvi": "NDVI स्कोअर:",
        "stat.weather": "हवामान सारांश:",
    },
    gu: {
        "dashboard.farmer": "ખેડૂત ડેશબોર્ડ",
        "dashboard.officer": "અધિકારી ડેશબોર્ડ",
        "farmer.name": "ખેડૂત:",
        "farmer.village": "ગામ:",
        "farmer.season": "મોસમ:",
        "farmer.crop": "પાક:",
        "btn.file_claim": "દાવો દાખલ કરો",
        "section.farm_info": "ખેતીની માહિતી",
        "section.claims": "દાવો સંચાલન",
        "section.resources": "સંસાધનો / સહાય",
        "card.land_area": "જમીન વિસ્તાર:",
        "card.crop_type": "પાકનો પ્રકાર:",
        "card.sowing_date": "વાવણી તારીખ:",
        "card.district": "જિલ્લો / તાલુકો / ગામ:",
        "tab.file_new": "નવો દાવો દાખલ કરો",
        "tab.history": "દાવો સ્થિતિ અને ઇતિહાસ",
        "claim.pending": "બાકી દાવાઓ",
        "claim.waiting": "મંજૂરીની રાહ જોઈ રહ્યું છે",
        "claim.approved": "મંજૂર દાવાઓ",
        "claim.rejected": "નકારાયેલા દાવાઓ",
        "resource.chatbot": "મદદ માટે ચેટબોટ",
        "resource.guidelines": "PMFBY માર્ગદર્શિકા",
        "resource.documents": "અગાઉના દાવાઓના દસ્તાવેજો",
        "resource.download": "ડાઉનલોડ",
        "officer.name": "અધિકારી:",
        "officer.district": "જિલ્લો:",
        "stat.moisture": "જમીનની ભેજ:",
        "stat.ndvi": "NDVI સ્કોર:",
        "stat.weather": "હવામાન સારાંશ:",
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
