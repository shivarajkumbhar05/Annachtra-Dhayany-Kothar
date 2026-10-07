const ROLES = { ADMIN: 'admin', OPERATOR: 'operator', VIEWER: 'viewer' };

// Unit key -> Marathi label (used on printed receipt)
const UNITS = {
  Kg: 'कि.ग्रॅ.',
  Quintal: 'क्विंटल',
  Ton: 'टन',
  Gram: 'ग्रॅम',
  Litre: 'लि.',
  Bag: 'पोते',
  Packet: 'पॅकेट',
  Tin: 'डबा',
  Piece: 'नग',
};

const DEFAULT_MATERIALS = [
  ['तांदूळ', 'Kg'], ['गहू', 'Kg'], ['तूर डाळ', 'Kg'], ['मूग डाळ', 'Kg'],
  ['मसूर डाळ', 'Kg'], ['चणे', 'Kg'], ['ज्वारी', 'Kg'], ['बाजरी', 'Kg'],
  ['साखर', 'Kg'], ['मीठ', 'Kg'], ['तेल', 'Litre'],
];

module.exports = { ROLES, UNITS, DEFAULT_MATERIALS };
