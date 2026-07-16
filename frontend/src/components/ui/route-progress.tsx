"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Start animation on route change
    setVisible(true);
    setProgress(0);

    const t1 = setTimeout(() => setProgress(40), 80);
    const t2 = setTimeout(() => setProgress(72), 250);
    const t3 = setTimeout(() => setProgress(92), 600);
    const t4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 300);
    }, 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="h-full origin-left"
            style={{
              background:
                "linear-gradient(90deg, var(--primary), var(--aurora-2), var(--aurora-3))",
              boxShadow: "0 0 12px var(--primary), 0 0 4px var(--aurora-2)",
            }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
