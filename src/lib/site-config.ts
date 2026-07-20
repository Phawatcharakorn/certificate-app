// Central place for footer / contact content that isn't page-specific
// copy. See README "Content management" note for why this lives in code
// rather than the database for now.

export const ORG_INFO = {
  name: "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา",
  nameEn: "Kasetsart University Sriracha Campus",
  // TODO: replace with the verified SDEC office address before launch.
  address: "199 หมู่ 6 ถนนสุขุมวิท ตำบลทุ่งสุขลา อำเภอศรีราชา จังหวัดชลบุรี 20230",
  phone: "038-352-000",
  phoneHref: "+6638352000",
  email: "sdec@src.ku.ac.th",
};

// TODO: replace "#" with the institution's real social profiles once confirmed.
export const SOCIAL_LINKS = [
  { label: "Facebook", href: "#", icon: "facebook" as const },
  { label: "Instagram", href: "#", icon: "instagram" as const },
  { label: "X (Twitter)", href: "#", icon: "x" as const },
];
