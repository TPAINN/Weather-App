import React, { memo } from 'react';
import { motion } from 'framer-motion';

// Custom animated search icon with intelligent morphing via Framer Motion
const SearchIcon = memo(({ isLoading }) => {
  return (
    <div style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.svg 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        animate={{ 
          rotate: isLoading ? 360 : 0,
          scale: isLoading ? 1.05 : 1
        }}
        transition={{ 
          rotate: { duration: isLoading ? 1.2 : 0.6, ease: isLoading ? "linear" : "easeOut", repeat: isLoading ? Infinity : 0 },
          scale: { duration: 0.3 }
        }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Search circle - smoothly transitions into a loading spinner orbit */}
        <motion.circle 
          cx="11" 
          cy="11" 
          r="7" 
          stroke="url(#searchGradient)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={false}
          animate={{
            cx: isLoading ? 12 : 11,
            cy: isLoading ? 12 : 11,
            r: isLoading ? 9 : 7,
            strokeDasharray: isLoading ? "15 45" : "44 0"
          }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
        />

        {/* Search handle - smartly shrinks and fades into the center */}
        <motion.path 
          d="M16 16L21 21"
          stroke="url(#searchGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={false}
          animate={{
            pathLength: isLoading ? 0 : 1,
            pathOffset: isLoading ? 1 : 0,
            opacity: isLoading ? 0 : 1
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        
        {/* Subtle liquid core pulsing during load for extreme professionalism */}
        <motion.circle 
          cx="12" 
          cy="12" 
          fill="url(#searchGradient)"
          opacity="0.6"
          initial={false}
          animate={{
            r: isLoading ? [0, 3, 0] : 0,
            opacity: isLoading ? [0.4, 0.8, 0.4] : 0
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut", 
            repeat: isLoading ? Infinity : 0 
          }}
        />
      </motion.svg>
    </div>
  );
});

export default SearchIcon;
