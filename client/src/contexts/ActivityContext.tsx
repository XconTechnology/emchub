import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

const INACTIVITY_MS = 60_000; // 1 minute – stop polling after this
const CHECK_MS = 5_000; // how often to re-check active state

type ActivityContextValue = {
  isActive: boolean;
};

const ActivityContext = createContext<ActivityContextValue>({ isActive: true });

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(true);
  const lastActivityRef = useRef(Date.now());

  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsActive(true);
  }, []);

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((ev) => window.addEventListener(ev, markActivity));
    return () => events.forEach((ev) => window.removeEventListener(ev, markActivity));
  }, [markActivity]);

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_MS) {
        setIsActive(false);
      }
    }, CHECK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <ActivityContext.Provider value={{ isActive }}>
      {children}
    </ActivityContext.Provider>
  );
}

/** Use in polling queries: refetchInterval: isActive ? 5000 : false */
export function useActivity(): boolean {
  return useContext(ActivityContext).isActive;
}
