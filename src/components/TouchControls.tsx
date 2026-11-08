import React, { useState, useEffect, useRef } from "react";
import { InputState } from "@/game/types";

interface TouchControlsProps {
  input: InputState;
  onFireToggle?: (active: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ input }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [stickBase, setStickBase] = useState<{ x: number; y: number } | null>(null);
  const [stickNub, setStickNub] = useState<{ x: number; y: number } | null>(null);
  const stickTouchId = useRef<number | null>(null);

  useEffect(() => {
    // Detect touch capability
    if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
      setIsTouchDevice(true);
    }
  }, []);

  const handleStickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (stickTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    stickTouchId.current = touch.identifier;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setStickBase({ x, y });
    setStickNub({ x, y });
    input.joystickActive = true;
  };

  const handleStickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (stickTouchId.current === null || !stickBase) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === stickTouchId.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;

        const dx = currentX - stickBase.x;
        const dy = currentY - stickBase.y;
        const maxDist = 45;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.001) {
          const clampedDist = Math.min(dist, maxDist);
          const normX = dx / dist;
          const normY = dy / dist;

          setStickNub({
            x: stickBase.x + normX * clampedDist,
            y: stickBase.y + normY * clampedDist,
          });

          input.joystickDirX = normX * (clampedDist / maxDist);
          input.joystickDirY = normY * (clampedDist / maxDist);
        }
        break;
      }
    }
  };

  const handleStickEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === stickTouchId.current) {
        stickTouchId.current = null;
        setStickBase(null);
        setStickNub(null);
        input.joystickActive = false;
        input.joystickDirX = 0;
        input.joystickDirY = 0;
        break;
      }
    }
  };

  if (!isTouchDevice) return null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10">
      {/* Left zone: movement joystick pad */}
      <div
        className="absolute left-0 bottom-0 w-1/2 h-1/2 pointer-events-auto touch-none"
        onTouchStart={handleStickStart}
        onTouchMove={handleStickMove}
        onTouchEnd={handleStickEnd}
        onTouchCancel={handleStickEnd}
      >
        {stickBase && stickNub && (
          <div
            className="absolute rounded-full border-2 border-cyan-400/40 bg-slate-900/50 backdrop-blur pointer-events-none"
            style={{
              width: 100,
              height: 100,
              left: stickBase.x - 50,
              top: stickBase.y - 50,
            }}
          >
            <div
              className="absolute w-10 h-10 rounded-full bg-cyan-400/80 shadow-[0_0_10px_#38bdf8]"
              style={{
                left: stickNub.x - stickBase.x + 30,
                top: stickNub.y - stickBase.y + 30,
              }}
            />
          </div>
        )}
      </div>

      {/* Right zone: auto fire / touch fire button */}
      <div className="absolute right-4 bottom-8 pointer-events-auto flex flex-col items-center gap-3">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            input.shooting = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            input.shooting = false;
          }}
          onMouseDown={() => (input.shooting = true)}
          onMouseUp={() => (input.shooting = false)}
          className={`w-20 h-20 rounded-full font-bold font-mono text-sm tracking-wider flex items-center justify-center border-2 shadow-2xl transition active:scale-95 ${
            input.shooting
              ? "bg-rose-500 border-rose-300 text-white shadow-[0_0_20px_rgba(244,63,94,0.8)]"
              : "bg-slate-900/80 border-cyan-500/60 text-cyan-300 backdrop-blur"
          }`}
          aria-label="Fire Weapons"
        >
          FIRE
        </button>
      </div>
    </div>
  );
};

