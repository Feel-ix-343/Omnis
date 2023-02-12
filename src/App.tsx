import { Component, createSignal } from 'solid-js';

import CalendarView from './CalendarView';
import Nav from './components/Nav';

const App: Component = () => {
  const [getIndex, setIndex] = createSignal(1); // Initialize on the calendar screen

  return (
    <div>
      <CalendarView />

      <Nav activeScreenIndex={getIndex()} setIndex={setIndex} />
    </div>
  );
};

export default App;
