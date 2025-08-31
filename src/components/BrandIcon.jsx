// src/components/BrandIcon.jsx
'use client';

const BRAND_SVGS = {
  // สีตามแบรนด์
  grab:   'https://cdn.simpleicons.org/grab/00B14F',
  bolt:   'https://cdn.simpleicons.org/bolt/00D775',
  // LINE MAN ยังไม่มีไอคอนแยกใน Simple Icons -> ใช้ LINE เป็นตัวแทน
  lineman:'https://cdn.simpleicons.org/line/00C300',
};

export default function BrandIcon({ brand, size = 28, className = '' }) {
  const src = BRAND_SVGS[brand];
  if (!src) return null;
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={`${brand} logo`}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}
