import { JSXElement } from "solid-js";

export default function Header(props: {children: JSXElement, class?: string}) {
  // TODO: implement this
  return (
    <div class={ "fixed bg-background-secondary rounded-br-3xl rounded-bl-3xl shadow-lg pt-10 px-5 pb-4 max-h-40 top-0 right-0 left-0 border-2 border-neutral-300" + props.class }>{props.children}</div>
  )
}
