import React from 'react';
import { FiCheck, FiNavigation, FiMousePointer, FiEdit3, FiEye } from 'react-icons/fi';

/**
 * Voice Action Indicator
 * Shows a floating notification when voice commands trigger UI actions
 */
const VoiceActionIndicator = ({ action, visible, onHide }) => {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000); // Auto-hide after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  const getActionIcon = () => {
    switch (action?.type) {
      case 'navigate':
        return <FiNavigation className="text-blue-500" size={20} />;
      case 'click':
        return <FiMousePointer className="text-green-500" size={20} />;
      case 'fill':
        return <FiEdit3 className="text-purple-500" size={20} />;
      case 'scroll':
        return <FiEye className="text-orange-500" size={20} />;
      default:
        return <FiCheck className="text-blue-500" size={20} />;
    }
  };

  const getActionColor = () => {
    switch (action?.type) {
      case 'navigate':
        return 'from-blue-500 to-blue-600';
      case 'click':
        return 'from-green-500 to-green-600';
      case 'fill':
        return 'from-purple-500 to-purple-600';
      case 'scroll':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="fixed top-20 right-6 z-[60] animate-slide-in-right">
      <div className={`bg-gradient-to-r ${getActionColor()} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm`}>
        <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
          {getActionIcon()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Voice Command</p>
          <p className="text-xs opacity-90">{action?.message || 'Processing...'}</p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default VoiceActionIndicator;
