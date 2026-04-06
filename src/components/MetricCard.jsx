import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ icon: Icon, value, label }) => {
  return (
    <motion.div 
      className="metric-card"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="metric-icon">
        <Icon size={20} />
      </div>
      <span className="metric-value">{value}</span>
      <span className="metric-label">{label}</span>
    </motion.div>
  );
};

export default MetricCard;
