import flatpickr from "flatpickr"
import "flatpickr/dist/flatpickr.css"
import { FlatpickrFn, Instance } from "flatpickr/dist/types/instance";

import { createEffect, createSignal, onCleanup, onMount } from "solid-js";

export default function DatePicker(props: { class?: string, id: string, placeholder?: string, setDate: (date: Date) => void, value?: Date}) {

  let flatPickerRef: Instance

  onMount(() => {
    flatPickerRef = flatpickr(`#${props.id}`, {
      defaultDate: props.value,
      onChange: (dates: Date[]) => { console.log(dates); props.setDate(dates[0]) }
    });
  })

  onCleanup(() => {
    flatPickerRef.destroy()
  })


  return (
    <input type="text" id={props.id} placeholder={props.placeholder} class={props.class} />
  )
}
