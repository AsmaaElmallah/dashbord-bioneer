/** الفئات العمرية للمكتبة — نفس قيم عمود age_band في Supabase وLibraryAgeBand في التطبيق. */
export const libraryAgeBands = [
  { id: 'm0_3', label: '0 – 3 شهور' },
  { id: 'm3_6', label: '3 – 6 شهور' },
  { id: 'm6_12', label: '6 – 12 شهر' },
  { id: 'm12_18', label: '12 – 18 شهر' },
  { id: 'm18_24', label: '18 – 24 شهر' },
];

export const DEFAULT_AGE_BAND = libraryAgeBands[0].id;

export function ageBandLabel(id) {
  return libraryAgeBands.find((b) => b.id === id)?.label ?? id;
}

/** مفاتيح الدول لرقم واتساب الأدمن. */
export const whatsappCountries = [
  { code: 'YE', dial: '967' },
  { code: 'SA', dial: '966' },
  { code: 'EG', dial: '20' },
  { code: 'AE', dial: '971' },
  { code: 'KW', dial: '965' },
  { code: 'QA', dial: '974' },
  { code: 'BH', dial: '973' },
  { code: 'OM', dial: '968' },
  { code: 'JO', dial: '962' },
  { code: 'IQ', dial: '964' },
  { code: 'SY', dial: '963' },
  { code: 'LB', dial: '961' },
  { code: 'PS', dial: '970' },
  { code: 'SD', dial: '249' },
  { code: 'LY', dial: '218' },
  { code: 'TN', dial: '216' },
  { code: 'DZ', dial: '213' },
  { code: 'MA', dial: '212' },
  { code: 'TR', dial: '90' },
  { code: 'GB', dial: '44' },
  { code: 'US', dial: '1' },
];

/** يفصل رقم دولي مخزّن (أرقام فقط) إلى مفتاح الدولة والرقم المحلي. */
export function splitWhatsappNumber(full) {
  const digits = (full ?? '').replace(/\D/g, '');
  if (!digits) return { country: whatsappCountries[0].code, local: '' };
  const match = [...whatsappCountries]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => digits.startsWith(c.dial));
  if (!match) return { country: whatsappCountries[0].code, local: digits };
  return { country: match.code, local: digits.slice(match.dial.length) };
}

export function joinWhatsappNumber(countryCode, local) {
  const country = whatsappCountries.find((c) => c.code === countryCode) ?? whatsappCountries[0];
  const digits = (local ?? '').replace(/\D/g, '').replace(/^0+/, '');
  return digits ? `${country.dial}${digits}` : '';
}

export function formatLocalNumber(local) {
  return (local ?? '').replace(/\D/g, '').replace(/(\d{3})(?=\d)/g, '$1 ');
}
