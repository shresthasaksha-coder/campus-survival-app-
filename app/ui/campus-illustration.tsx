// Small SVG illustration used on the home page.
export default function CampusIllustration() {
  return (
    <svg className="campus-illustration" viewBox="0 0 390 260" aria-hidden="true">
      <circle cx="213" cy="125" r="111" fill="#dce9d9" />
      <path d="M28 219h341" stroke="#b5cbb9" strokeWidth="3" />
      <path d="M63 219V116l46-27 46 27v103" fill="#f8f5e8" stroke="#789783" strokeWidth="2" />
      <path
        d="m59 117 50-31 50 31"
        fill="none"
        stroke="#165b40"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M155 219V103h139v116" fill="#f8f5e8" stroke="#789783" strokeWidth="2" />
      <path d="M166 103V82h117v21" fill="#b2cbb5" stroke="#789783" strokeWidth="2" />
      <path d="M198 82V47h52v35" fill="#f8f5e8" stroke="#789783" strokeWidth="2" />
      <path d="m194 48 30-22 30 22" fill="#165b40" />
      <circle cx="224" cy="62" r="9" fill="#fff" stroke="#789783" strokeWidth="2" />
      <path d="M224 56v6l5 3" fill="none" stroke="#165b40" strokeWidth="2" />
      {[180, 219, 258].map((x) => (
        <g key={x}>
          {[121, 155].map((y) => (
            <rect
              key={y}
              x={x}
              y={y}
              width="16"
              height="22"
              rx="4"
              fill="#b2cbb5"
              stroke="#789783"
            />
          ))}
        </g>
      ))}
      <path d="M210 219v-26a14 14 0 0 1 28 0v26" fill="#165b40" />
      <path d="m210 220-22 25h70l-20-25" fill="#e8d9b9" />
      <path d="M79 142h18v24H79zm42 0h18v24h-18z" fill="#b2cbb5" />
      <path d="M101 219v-34h17v34" fill="#165b40" />
      <path d="M325 219v-66M45 218v-40" stroke="#789783" strokeWidth="4" />
      <circle cx="325" cy="142" r="27" fill="#9fbd9f" />
      <circle cx="45" cy="171" r="19" fill="#b2cbb5" />
      <path d="M298 56h25m-12-12v25" stroke="#e0b954" strokeWidth="2" />
      <path d="m57 62 5 5 5-5m264 29 5 5 5-5" stroke="#789783" strokeWidth="2" fill="none" />
    </svg>
  );
}
