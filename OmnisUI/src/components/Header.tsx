import { JSXElement } from "solid-js";

export default function Header(props: {children: JSXElement, class?: string}) {
  // TODO: implement this
  return (
    <div class={ "fixed bg-background-secondary rounded-br-3xl rounded-bl-3xl shadow-lg p-10 max-h-40 top-0 right-0 left-0 z-50 " + props.class }>{props.children}</div>
  )
}
