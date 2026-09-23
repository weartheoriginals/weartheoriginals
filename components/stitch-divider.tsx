'use client';

import { motion } from 'motion/react';

export default function StitchDivider() {
  return (
    <div className="w-full overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 1000 2" preserveAspectRatio="none" className="w-full h-[2px]">
        <motion.line
          x1="0"
          y1="1"
          x2="1000"
          y2="1"
          stroke="var(--hairline)"
          strokeWidth="2"
          strokeDasharray="10 8"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-20% 0px' }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}
