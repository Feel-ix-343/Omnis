import { FaRegularClock, FaRegularSquareCheck } from 'solid-icons/fa'
import { BsGear, BsGearWide } from 'solid-icons/bs'
import { createSignal } from "solid-js"

export default function Nav (props: {activeScreenIndex: number, setIndex: (index: number) => void}){

  const switchScreen = (index: number) => {
    props.setIndex(index)
    console.log(props.activeScreenIndex)
  }

  const classes = (index: number) => { return `mx-auto ${props.activeScreenIndex === index ? "fill-primary" : "fill-white"}` }

  return(
    <div 
      style={{"box-shadow": "inset 0px -8px 4px 7px rgba(0, 0, 0, 0.2), 0px 2px 9px 2px rgba(0, 0, 0, 0.4)"}}
      class="fixed left-0 right-0 bg-primary inset-x-2 h-16 bottom-7 rounded-full mx-20 px-2 grid grid-cols-3 items-center"
    >
      <div class="z-50 text-white"><FaRegularSquareCheck onclick={() => switchScreen(0)} class={classes(0)} size={40} /></div>
      <div class="z-50"><FaRegularClock onclick={() => switchScreen(1)} class={classes(1)} size={40} /></div>
      <div class="z-50 text-white"><BsGear onclick={() => switchScreen(2)} class={classes(2)} size={40} /></div>
      <div 
        class={ `rounded-full bg-highlight border-green-400 transition-all border-2 w-[80px] h-[80px] shadow-highlight shadow-md absolute left-0 right-0 ${
          props.activeScreenIndex === 0 ? "left-[2%]" : props.activeScreenIndex === 1 ? "left-[32%]" : "left-[63%]"
        }` } />
    </div>
  )
}
