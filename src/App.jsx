import { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from './lib/motion';
import SvgDefs from './components/SvgDefs';
import Intro from './components/Intro';
import Nav from './components/Nav';
import Hero from './sections/Hero';
import Wishes from './sections/Wishes';
import LightUp from './sections/LightUp';
import GoldenMoments from './sections/GoldenMoments';
import Finale from './sections/Finale';

export default function App() {
  const [ready, setReady] = useState(false);
  const reveal = useCallback(() => setReady(true), []);

  useEffect(() => {
    // Web fonts change line lengths; re-measure scroll positions once they land.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SvgDefs />
      <Intro onReveal={reveal} />
      <Nav ready={ready} />
      <main>
        <Hero ready={ready} />
        <Wishes />
        <LightUp />
        <GoldenMoments />
        <Finale />
      </main>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
