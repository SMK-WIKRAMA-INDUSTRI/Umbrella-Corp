import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export const AnimeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeAnimRef = useRef<any>(null);
  const lastWaveTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const nodes = containerRef.current.querySelectorAll('.anime-stagger-node');
    if (!nodes || nodes.length === 0) return;

    try {
      // Grid stagger animation inspired by the signature showcase on animejs.com
      activeAnimRef.current = animate(nodes, {
        scale: [0.4, 1.2, 0.75],
        opacity: [0.15, 0.6, 0.25],
        delay: stagger(90, {
          from: 'center',
        }),
        loop: true,
        alternate: true,
        ease: 'inOutSine',
      });

      return () => {
        try {
          if (activeAnimRef.current) {
            activeAnimRef.current.pause();
          }
        } catch (_) {}
      };
    } catch (err) {
      console.warn('AnimeBackground failed to start:', err);
    }
  }, []);

  // Handle subtle interactive mouse ripple wave with throttle to prevent memory leak & CPU spike
  const handleMouseMove = () => {
    const now = Date.now();
    if (now - lastWaveTimeRef.current < 600) return; // Throttled to 600ms
    lastWaveTimeRef.current = now;

    if (!containerRef.current) return;
    const nodes = containerRef.current.querySelectorAll('.anime-stagger-node');
    if (!nodes || nodes.length === 0) return;

    try {
      animate(nodes, {
        scale: [1, 1.3, 1],
        delay: stagger(15, {
          from: 'center',
        }),
        duration: 700,
        ease: 'outElastic',
      });
    } catch (_) {}
  };

  // Generate 7 rows x 12 columns = 84 subtle aesthetic dots & crosses
  const items = Array.from({ length: 84 });

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseMove}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 flex items-center justify-center opacity-40 sm:opacity-50"
      aria-hidden="true"
    >
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-6 sm:gap-10 w-full max-w-[1200px] px-6 place-items-center">
        {items.map((_, i) => {
          const isCross = i % 4 === 0;
          const isRed = i % 6 === 0;

          return (
            <div
              key={i}
              className="anime-stagger-node flex items-center justify-center w-3 h-3 transition-transform"
            >
              {isCross ? (
                <span
                  className={`text-[11px] font-mono font-bold leading-none select-none ${
                    isRed ? 'text-[#E11D48]' : 'text-slate-400'
                  }`}
                >
                  +
                </span>
              ) : (
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isRed ? 'bg-[#E11D48]' : 'bg-slate-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
