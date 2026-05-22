import { motion, AnimatePresence } from "framer-motion";

const ECG_PATH =
  "M0 40 H120 L130 40 L136 18 L142 62 L148 10 L154 58 L160 40 H220 L230 40 L236 22 L242 58 L248 26 L254 48 L260 40 H340 L350 40 L356 20 L362 60 L368 14 L374 52 L380 40 H1200";

const CENTER_Y = 40;

export default function HeartbeatBar({ pulseKey }) {
  if (pulseKey === 0) {
    return null;
  }

  return (
    <div className="heartbeat-bar" aria-hidden>
      <svg
        className="heartbeat-bar__svg"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
      >
        <line
          className="heartbeat-bar__centerline"
          x1="0"
          y1={CENTER_Y}
          x2="1200"
          y2={CENTER_Y}
        />
        <path className="heartbeat-bar__track" d={ECG_PATH} />
        <AnimatePresence>
          <motion.path
            key={pulseKey}
            className="heartbeat-bar__wave"
            d={ECG_PATH}
            initial={{ pathLength: 0, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: [0.6, 1, 0.9, 0] }}
            transition={{ duration: 1.15, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </svg>

      <AnimatePresence>
        <motion.div
          key={`heart-${pulseKey}`}
          className="heartbeat-bar__heart"
          initial={{ left: "0%", scale: 0.5, opacity: 0 }}
          animate={{
            left: "calc(100% - 3rem)",
            scale: [0.5, 1.25, 0.95, 1.2, 0.85, 1.1, 0.75],
            opacity: [0, 1, 1, 1, 1, 0.9, 0],
          }}
          transition={{
            left: { duration: 1.15, ease: "easeInOut" },
            scale: { duration: 1.15, times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1] },
            opacity: { duration: 1.15, times: [0, 0.05, 0.2, 0.5, 0.7, 0.9, 1] },
          }}
        >
          ♥
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
