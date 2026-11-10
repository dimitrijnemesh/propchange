/**
 * Dial codes for phone sign-in. Restricted jurisdictions are excluded at the source so they can
 * never be selected — edit `RESTRICTED` to change the policy.
 */
export const RESTRICTED = new Set(["RU", "BY", "IR", "KP", "SY", "CU"]);

export interface Country {
  iso: string;
  name: string;
  dial: string;
}

const ALL: Country[] = [
  { iso: "UA", name: "Ukraine", dial: "+380" },
  { iso: "US", name: "United States", dial: "+1" },
  { iso: "GB", name: "United Kingdom", dial: "+44" },
  { iso: "PL", name: "Poland", dial: "+48" },
  { iso: "DE", name: "Germany", dial: "+49" },
  { iso: "FR", name: "France", dial: "+33" },
  { iso: "ES", name: "Spain", dial: "+34" },
  { iso: "IT", name: "Italy", dial: "+39" },
  { iso: "PT", name: "Portugal", dial: "+351" },
  { iso: "NL", name: "Netherlands", dial: "+31" },
  { iso: "BE", name: "Belgium", dial: "+32" },
  { iso: "CH", name: "Switzerland", dial: "+41" },
  { iso: "AT", name: "Austria", dial: "+43" },
  { iso: "IE", name: "Ireland", dial: "+353" },
  { iso: "SE", name: "Sweden", dial: "+46" },
  { iso: "NO", name: "Norway", dial: "+47" },
  { iso: "DK", name: "Denmark", dial: "+45" },
  { iso: "FI", name: "Finland", dial: "+358" },
  { iso: "EE", name: "Estonia", dial: "+372" },
  { iso: "LV", name: "Latvia", dial: "+371" },
  { iso: "LT", name: "Lithuania", dial: "+370" },
  { iso: "CZ", name: "Czechia", dial: "+420" },
  { iso: "SK", name: "Slovakia", dial: "+421" },
  { iso: "HU", name: "Hungary", dial: "+36" },
  { iso: "RO", name: "Romania", dial: "+40" },
  { iso: "MD", name: "Moldova", dial: "+373" },
  { iso: "BG", name: "Bulgaria", dial: "+359" },
  { iso: "GR", name: "Greece", dial: "+30" },
  { iso: "HR", name: "Croatia", dial: "+385" },
  { iso: "SI", name: "Slovenia", dial: "+386" },
  { iso: "RS", name: "Serbia", dial: "+381" },
  { iso: "GE", name: "Georgia", dial: "+995" },
  { iso: "AM", name: "Armenia", dial: "+374" },
  { iso: "AZ", name: "Azerbaijan", dial: "+994" },
  { iso: "KZ", name: "Kazakhstan", dial: "+7" },
  { iso: "TR", name: "Türkiye", dial: "+90" },
  { iso: "CY", name: "Cyprus", dial: "+357" },
  { iso: "MT", name: "Malta", dial: "+356" },
  { iso: "IL", name: "Israel", dial: "+972" },
  { iso: "AE", name: "United Arab Emirates", dial: "+971" },
  { iso: "SA", name: "Saudi Arabia", dial: "+966" },
  { iso: "QA", name: "Qatar", dial: "+974" },
  { iso: "EG", name: "Egypt", dial: "+20" },
  { iso: "MA", name: "Morocco", dial: "+212" },
  { iso: "NG", name: "Nigeria", dial: "+234" },
  { iso: "GH", name: "Ghana", dial: "+233" },
  { iso: "KE", name: "Kenya", dial: "+254" },
  { iso: "ZA", name: "South Africa", dial: "+27" },
  { iso: "IN", name: "India", dial: "+91" },
  { iso: "PK", name: "Pakistan", dial: "+92" },
  { iso: "BD", name: "Bangladesh", dial: "+880" },
  { iso: "LK", name: "Sri Lanka", dial: "+94" },
  { iso: "CN", name: "China", dial: "+86" },
  { iso: "HK", name: "Hong Kong", dial: "+852" },
  { iso: "TW", name: "Taiwan", dial: "+886" },
  { iso: "JP", name: "Japan", dial: "+81" },
  { iso: "KR", name: "South Korea", dial: "+82" },
  { iso: "SG", name: "Singapore", dial: "+65" },
  { iso: "MY", name: "Malaysia", dial: "+60" },
  { iso: "TH", name: "Thailand", dial: "+66" },
  { iso: "VN", name: "Vietnam", dial: "+84" },
  { iso: "PH", name: "Philippines", dial: "+63" },
  { iso: "ID", name: "Indonesia", dial: "+62" },
  { iso: "AU", name: "Australia", dial: "+61" },
  { iso: "NZ", name: "New Zealand", dial: "+64" },
  { iso: "CA", name: "Canada", dial: "+1" },
  { iso: "MX", name: "Mexico", dial: "+52" },
  { iso: "BR", name: "Brazil", dial: "+55" },
  { iso: "AR", name: "Argentina", dial: "+54" },
  { iso: "CL", name: "Chile", dial: "+56" },
  { iso: "CO", name: "Colombia", dial: "+57" },
  { iso: "PE", name: "Peru", dial: "+51" },
  // restricted — filtered out below, kept here so the policy is explicit
  { iso: "RU", name: "Russia", dial: "+7" },
  { iso: "BY", name: "Belarus", dial: "+375" },
  { iso: "IR", name: "Iran", dial: "+98" },
  { iso: "KP", name: "North Korea", dial: "+850" },
  { iso: "SY", name: "Syria", dial: "+963" },
  { iso: "CU", name: "Cuba", dial: "+53" },
];

/** Selectable countries: Ukraine first, then alphabetical. */
export const COUNTRIES: Country[] = ALL.filter((c) => !RESTRICTED.has(c.iso)).sort((a, b) =>
  a.iso === "UA" ? -1 : b.iso === "UA" ? 1 : a.name.localeCompare(b.name),
);

/** Regional-indicator flag emoji from an ISO code. */
export const flagOf = (iso: string) => String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
