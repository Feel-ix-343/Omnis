import { JSXElement } from "solid-js";

export default function Button(props: {children: JSXElement, class?: string, focus?: {focuson: () => void, focusoff: () => void}}) {

  return (
    <button 
      class={ "bg-background-secondary text-primary font-bold px-3 py-1 rounded-xl shadow-md flex items-center border-2 border-neutral-200 " + props.class } 
      ontouchstart={props.focus?.focuson}
    >{props.children}</button>
  )
}
