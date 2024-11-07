import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const THRESHOLD = 80;
  const MAX_PULL = 120;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (containerRef.current?.scrollTop === 0) {
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const y = e.touches[0].clientY;
      const diff = Math.min(MAX_PULL, Math.max(0, y - startY));
      setCurrentY(diff);

      if (diff > 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!isDragging) return;

      setIsDragging(false);

      if (currentY >= THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }

      setCurrentY(0);
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd);

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, startY, currentY, isRefreshing, onRefresh]);

  useEffect(() => {
    if (isRefreshing) {
      controls.start({ rotate: 360 });
    } else {
      controls.stop();
    }
  }, [isRefreshing, controls]);

  const progress = Math.min(1, currentY / THRESHOLD);

  return (
    <div 
      ref={containerRef} 
      className="h-full overflow-y-auto relative"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div
        className="absolute left-0 right-0 flex justify-center pointer-events-none"
        style={{
          transform: `translateY(${Math.min(MAX_PULL, currentY - 40)}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        <motion.div
          animate={controls}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="bg-white rounded-full shadow-md p-2"
        >
          <RefreshCw 
            className="w-6 h-6 text-purple-600"
            style={{
              opacity: progress,
              transform: `rotate(${currentY * 2}deg)`
            }}
          />
        </motion.div>
      </div>

      <div
        style={{
          transform: `translateY(${currentY}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;