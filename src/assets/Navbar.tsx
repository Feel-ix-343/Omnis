export default function Navbar(props: {class: string}) {
  return(
    <svg class={props.class} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="334" height="131" viewBox="0 0 334 131">
      <defs>
        <filter id="Rectangle_1" x="0" y="0" width="334" height="131" filterUnits="userSpaceOnUse">
          <feOffset dx="-10" dy="10" input="SourceAlpha"/>
          <feGaussianBlur stdDeviation="10" result="blur"/>
          <feFlood flood-opacity="0.212"/>
          <feComposite operator="in" in2="blur"/>
          <feComposite in="SourceGraphic"/>
        </filter>
        <filter id="Rectangle_1-2" x="0" y="0" width="334" height="131" filterUnits="userSpaceOnUse">
          <feOffset dx="5" dy="-10" input="SourceAlpha"/>
          <feGaussianBlur stdDeviation="10" result="blur-2"/>
          <feFlood flood-opacity="0.89" result="color"/>
          <feComposite operator="out" in="SourceGraphic" in2="blur-2"/>
          <feComposite operator="in" in="color"/>
          <feComposite operator="in" in2="SourceGraphic"/>
        </filter>
      </defs>
      <g data-type="innerShadowGroup">
        <g transform="matrix(1, 0, 0, 1, 0, 0)" filter="url(#Rectangle_1)">
          <rect id="Rectangle_1-3" data-name="Rectangle 1" width="274" height="71" rx="35.5" transform="translate(40 20)" fill="#3a3a3a"/>
        </g>
        <g transform="matrix(1, 0, 0, 1, 0, 0)" filter="url(#Rectangle_1-2)">
          <rect id="Rectangle_1-4" data-name="Rectangle 1" width="274" height="71" rx="35.5" transform="translate(40 20)" fill="#fff"/>
        </g>
      </g>
    </svg>

  )
}
