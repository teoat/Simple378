import { useState, useEffect, useRef, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';

interface TouchGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  preventScrollOnSwipe?: boolean;
}

export function useTouchGestures(config: TouchGestureConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    swipeThreshold = 50,
    preventScrollOnSwipe = false
  } = config;

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const minSwipeDistance = swipeThreshold;

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd(null);
    setTouchStart({ x: touch.clientX, y: touch.clientY });

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }, 500); // 500ms for long press
    }
  }, [onLongPress]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    // Handle swipes
    if (isLeftSwipe && onSwipeLeft) {
      if (preventScrollOnSwipe) e.preventDefault();
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      if (preventScrollOnSwipe) e.preventDefault();
      onSwipeRight();
    } else if (isUpSwipe && onSwipeUp) {
      if (preventScrollOnSwipe) e.preventDefault();
      onSwipeUp();
    } else if (isDownSwipe && onSwipeDown) {
      if (preventScrollOnSwipe) e.preventDefault();
      onSwipeDown();
    } else {
      // Handle taps
      const currentTime = Date.now();
      const timeDiff = currentTime - lastTapTime;

      if (timeDiff < 300 && tapCount === 1) {
        // Double tap
        if (onDoubleTap) onDoubleTap();
        setTapCount(0);
      } else if (timeDiff < 300) {
        setTapCount(tapCount + 1);
      } else {
        setTapCount(1);
        // Single tap
        if (onTap) onTap();
      }

      setLastTapTime(currentTime);
    }
  }, [touchStart, touchEnd, minSwipeDistance, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, preventScrollOnSwipe, lastTapTime, tapCount]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}

// Mobile-optimized card component with touch interactions
export function MobileCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  onDoubleTap,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  className?: string;
  [key: string]: any;
}) {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    preventScrollOnSwipe: true,
    trackMouse: false
  });

  const [isPressed, setIsPressed] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const lastTapTime = useRef(0);

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);

    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime.current;

    if (timeDiff < 300) {
      setTapCount(prev => prev + 1);
      if (tapCount >= 1) {
        // Double tap detected
        if (onDoubleTap) onDoubleTap();
        setTapCount(0);
      }
    } else {
      setTapCount(1);
      // Single tap
      if (onTap) onTap();
    }

    lastTapTime.current = currentTime;
  };

  return (
    <div
      {...swipeHandlers}
      className={`touch-manipulation select-none ${className} ${
        isPressed ? 'scale-95' : 'scale-100'
      } transition-transform duration-100`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Mobile navigation hook
export function useMobileNavigation() {
  const [currentView, setCurrentView] = useState('main');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['main']);

  const navigateTo = useCallback((view: string) => {
    setCurrentView(view);
    setNavigationHistory(prev => [...prev, view]);
  }, []);

  const goBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousView = newHistory[newHistory.length - 1];
      setCurrentView(previousView);
      setNavigationHistory(newHistory);
    }
  }, [navigationHistory]);

  const canGoBack = navigationHistory.length > 1;

  return {
    currentView,
    navigateTo,
    goBack,
    canGoBack,
    navigationHistory
  };
}

// Mobile keyboard hook
export function useMobileKeyboard() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const viewport = window.visualViewport;
      if (viewport) {
        const heightDiff = window.innerHeight - viewport.height;
        setIsKeyboardVisible(heightDiff > 150); // Keyboard is likely visible
        setKeyboardHeight(heightDiff);
      }
    };

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        // Keyboard might appear, check after a delay
        setTimeout(handleResize, 300);
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        const viewport = window.visualViewport;
        if (viewport && window.innerHeight - viewport.height < 150) {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
        }
      }, 300);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      document.addEventListener('focusin', handleFocus);
      document.addEventListener('focusout', handleBlur);

      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
        document.removeEventListener('focusin', handleFocus);
        document.removeEventListener('focusout', handleBlur);
      };
    }
  }, []);

  return {
    isKeyboardVisible,
    keyboardHeight
  };
}

// Mobile viewport hook
export function useMobileViewport() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return viewport;
}

// Pull-to-refresh hook
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setStartY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) { // Only when at top
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      if (distance > 0) {
        setPullDistance(Math.min(distance * 0.5, 100)); // Dampen and limit
        setCanRefresh(distance > 80); // Threshold for refresh
      }
    }
  }, [startY]);

  const handleTouchEnd = useCallback(async () => {
    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setCanRefresh(false);
  }, [canRefresh, isRefreshing, onRefresh]);

  return {
    isRefreshing,
    pullDistance,
    canRefresh,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}

// Mobile-optimized table with horizontal scroll and touch interactions
export function MobileTable({
  data,
  columns,
  onRowTap,
  onRowSwipeLeft,
  onRowSwipeRight,
  className = ''
}: {
  data: any[];
  columns: { key: string; label: string; width?: number }[];
  onRowTap?: (row: any) => void;
  onRowSwipeLeft?: (row: any) => void;
  onRowSwipeRight?: (row: any) => void;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                style={{ minWidth: column.width || 120 }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
          {data.map((row, index) => (
            <MobileCard
              key={index}
              onTap={() => onRowTap?.(row)}
              onSwipeLeft={() => onRowSwipeLeft?.(row)}
              onSwipeRight={() => onRowSwipeRight?.(row)}
              className="hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <tr>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100"
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            </MobileCard>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mobile bottom sheet component
export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = ['50%', '90%']
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  snapPoints?: string[];
}) {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-2xl shadow-xl transform transition-transform duration-300"
        style={{
          height: snapPoints[currentSnapPoint],
          maxHeight: '90vh'
        }}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}