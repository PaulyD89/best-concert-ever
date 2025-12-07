// Translation utility for Best Concert Ever
// Handles label translations across different markets

export const translateLabel = (label, userMarket) => {
  if (userMarket === 'MX') {
    const translations = {
      'Opener': 'Telonero',
      '2nd Opener': '2º Telonero',
      'Headliner': 'Cabeza de Cartel'
    };
    return translations[label] || label;
  }
  
  if (userMarket === 'BR') {
    const translations = {
      'Opener': 'Abertura',
      '2nd Opener': '2ª Abertura',
      'Headliner': 'Atração Principal'
    };
    return translations[label] || label;
  }
  
  return label;
};