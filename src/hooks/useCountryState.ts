import { useState, useEffect } from 'react';

export interface Country {
  code: string;
  name: string;
}

export interface State {
  code: string;
  name: string;
}

// Major countries with their states
const COUNTRIES_WITH_STATES: Record<string, { country: Country; states: State[] }> = {
  IN: {
    country: { code: 'IN', name: 'India' },
    states: [
      { code: 'AP', name: 'Andhra Pradesh' },
      { code: 'AR', name: 'Arunachal Pradesh' },
      { code: 'AS', name: 'Assam' },
      { code: 'BR', name: 'Bihar' },
      { code: 'CG', name: 'Chhattisgarh' },
      { code: 'GA', name: 'Goa' },
      { code: 'GJ', name: 'Gujarat' },
      { code: 'HR', name: 'Haryana' },
      { code: 'HP', name: 'Himachal Pradesh' },
      { code: 'JK', name: 'Jammu and Kashmir' },
      { code: 'JH', name: 'Jharkhand' },
      { code: 'KA', name: 'Karnataka' },
      { code: 'KL', name: 'Kerala' },
      { code: 'MP', name: 'Madhya Pradesh' },
      { code: 'MH', name: 'Maharashtra' },
      { code: 'MN', name: 'Manipur' },
      { code: 'ML', name: 'Meghalaya' },
      { code: 'MZ', name: 'Mizoram' },
      { code: 'NL', name: 'Nagaland' },
      { code: 'OR', name: 'Odisha' },
      { code: 'PB', name: 'Punjab' },
      { code: 'RJ', name: 'Rajasthan' },
      { code: 'SK', name: 'Sikkim' },
      { code: 'TN', name: 'Tamil Nadu' },
      { code: 'TG', name: 'Telangana' },
      { code: 'TR', name: 'Tripura' },
      { code: 'UP', name: 'Uttar Pradesh' },
      { code: 'UT', name: 'Uttarakhand' },
      { code: 'WB', name: 'West Bengal' },
      { code: 'AN', name: 'Andaman and Nicobar Islands' },
      { code: 'CH', name: 'Chandigarh' },
      { code: 'DH', name: 'Dadra and Nagar Haveli' },
      { code: 'DD', name: 'Daman and Diu' },
      { code: 'DL', name: 'Delhi' },
      { code: 'LD', name: 'Lakshadweep' },
      { code: 'PY', name: 'Puducherry' }
    ]
  },
  US: {
    country: { code: 'US', name: 'United States' },
    states: [
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
      { code: 'DE', name: 'Delaware' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' },
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'MO', name: 'Missouri' },
      { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'OR', name: 'Oregon' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' },
      { code: 'WI', name: 'Wisconsin' },
      { code: 'WY', name: 'Wyoming' }
    ]
  },
  GB: {
    country: { code: 'GB', name: 'United Kingdom' },
    states: [
      { code: 'ENG', name: 'England' },
      { code: 'SCT', name: 'Scotland' },
      { code: 'WLS', name: 'Wales' },
      { code: 'NIR', name: 'Northern Ireland' }
    ]
  },
  CA: {
    country: { code: 'CA', name: 'Canada' },
    states: [
      { code: 'AB', name: 'Alberta' },
      { code: 'BC', name: 'British Columbia' },
      { code: 'MB', name: 'Manitoba' },
      { code: 'NB', name: 'New Brunswick' },
      { code: 'NL', name: 'Newfoundland and Labrador' },
      { code: 'NS', name: 'Nova Scotia' },
      { code: 'ON', name: 'Ontario' },
      { code: 'PE', name: 'Prince Edward Island' },
      { code: 'QC', name: 'Quebec' },
      { code: 'SK', name: 'Saskatchewan' },
      { code: 'NT', name: 'Northwest Territories' },
      { code: 'NU', name: 'Nunavut' },
      { code: 'YT', name: 'Yukon' }
    ]
  }
};

// All countries list
const ALL_COUNTRIES: Country[] = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'NP', name: 'Nepal' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'MV', name: 'Maldives' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
  { code: 'JO', name: 'Jordan' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'IL', name: 'Israel' },
  { code: 'TR', name: 'Turkey' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'MX', name: 'Mexico' },
  { code: 'RU', name: 'Russia' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'MT', name: 'Malta' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'GR', name: 'Greece' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IS', name: 'Iceland' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'NZ', name: 'New Zealand' }
];

export const useCountryState = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [availableStates, setAvailableStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [customState, setCustomState] = useState('');

  useEffect(() => {
    const detectCountry = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://ipapi.co/json/');
        
        if (response.ok) {
          const data = await response.json();
          const countryCode = data.country_code;
          
          // Find country in our list
          const country = ALL_COUNTRIES.find(c => c.code === countryCode);
          if (country) {
            setSelectedCountry(country);
            updateStatesForCountry(countryCode);
          } else {
            // Default to India if country not found
            setSelectedCountry(ALL_COUNTRIES.find(c => c.code === 'IN') || ALL_COUNTRIES[0]);
            updateStatesForCountry('IN');
          }
        } else {
          // Default to India on error
          setSelectedCountry(ALL_COUNTRIES.find(c => c.code === 'IN') || ALL_COUNTRIES[0]);
          updateStatesForCountry('IN');
        }
      } catch (error) {
        console.error('Error detecting country:', error);
        // Default to India on error
        setSelectedCountry(ALL_COUNTRIES.find(c => c.code === 'IN') || ALL_COUNTRIES[0]);
        updateStatesForCountry('IN');
      } finally {
        setLoading(false);
      }
    };

    detectCountry();
  }, []);

  const updateStatesForCountry = (countryCode: string) => {
    const countryData = COUNTRIES_WITH_STATES[countryCode];
    if (countryData) {
      setAvailableStates(countryData.states);
    } else {
      setAvailableStates([]);
    }
  };

  const changeCountry = (country: Country) => {
    setSelectedCountry(country);
    updateStatesForCountry(country.code);
    setCustomState('');
  };

  const filterCountries = (searchTerm: string): Country[] => {
    if (!searchTerm) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterStates = (searchTerm: string): State[] => {
    if (!searchTerm) return availableStates;
    return availableStates.filter(state =>
      state.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    selectedCountry,
    availableStates,
    loading,
    customState,
    setCustomState,
    changeCountry,
    filterCountries,
    filterStates,
    allCountries: ALL_COUNTRIES
  };
};
