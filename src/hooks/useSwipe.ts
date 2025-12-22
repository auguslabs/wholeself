import { useState, useRef, useEffect } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Distancia mínima en px para considerar un swipe
}

/**
 * Hook para detectar gestos de swipe (deslizar)
 * Mejorado para detectar solo swipes horizontales y evitar conflictos con scroll vertical
 * Funciona en todas las versiones del team (v1, v2, v3, v4)
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: SwipeHandlers) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const isScrolling = useRef(false);

  const minSwipeDistance = threshold;

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchEnd(null);
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    isScrolling.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    
    if (touchStart) {
      const deltaX = Math.abs(touch.clientX - touchStart.x);
      const deltaY = Math.abs(touch.clientY - touchStart.y);
      
      // Si el movimiento vertical es mayor, es scroll, no swipe
      if (deltaY > deltaX && deltaY > 10) {
        isScrolling.current = true;
      }
    }
    
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isScrolling.current) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = Math.abs(touchStart.y - touchEnd.y);
    const absDistanceX = Math.abs(distanceX);

    // Solo considerar swipe si el movimiento horizontal es mayor que el vertical
    // Esto evita conflictos con el scroll vertical
    if (absDistanceX > distanceY && absDistanceX > minSwipeDistance) {
      const isLeftSwipe = distanceX > 0;
      const isRightSwipe = distanceX < 0;

      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    }

    // Limpiar estado
    setTouchStart(null);
    setTouchEnd(null);
    isScrolling.current = false;
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}



