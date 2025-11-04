"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function ModernCalendar({
  label,
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
  className = "",
  autoOpen = false,
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? new Date(selectedDate) : new Date()
  );
  const calendarRef = useRef(null);
  const buttonRef = useRef(null);

  // Handle auto-open
  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true);
    }
  }, [autoOpen]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    if (!date) return "Select date";
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (date < min) return true;
    }
    
    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
      if (date > max) return true;
    }
    
    return false;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateDisabled(newDate)) {
      onDateChange(newDate);
      handleClose();
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const startDay = firstDayOfMonth(currentMonth);
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const disabled = isDateDisabled(date);
      const today = isToday(date);
      const selected = isSelected(date);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={disabled}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-all
            ${disabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-orange-50 hover:text-[#F47B20] cursor-pointer text-gray-700'
            }
            ${today && !selected ? 'border-2 border-[#F47B20] text-[#F47B20]' : ''}
            ${selected 
              ? 'bg-[#F47B20] text-white hover:bg-[#E06A0F]' 
              : ''
            }
          `}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="text-sm font-medium mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#F47B20]" />
          {label}
        </label>
      )}
      
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left text-sm border-2 border-gray-300 rounded-lg hover:border-[#F47B20] focus:border-[#F47B20] focus:outline-none focus:ring-2 focus:ring-[#F47B20]/20 bg-white transition-all"
      >
        <div className="flex items-center justify-between">
          <span className={selectedDate ? "text-gray-900" : "text-gray-400"}>
            {formatDate(selectedDate)}
          </span>
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
      </button>
      
      {isOpen && (
        <div 
          ref={calendarRef}
          className="fixed z-50 p-4 bg-white rounded-xl shadow-xl border border-gray-200 w-80 max-w-[90vw] md:absolute"
          style={{ 
            // Mobile: center on screen
            top: typeof window !== 'undefined' && window.innerWidth < 768 ? '50%' : 'auto',
            left: typeof window !== 'undefined' && window.innerWidth < 768 ? '50%' : 'auto',
            transform: typeof window !== 'undefined' && window.innerWidth < 768 ? 'translate(-50%, -50%)' : 'none',
            // Desktop: position relative to button
            ...(typeof window !== 'undefined' && window.innerWidth >= 768 && {
              position: 'absolute',
              marginTop: '0.5rem'
            })
          }}
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-xs font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                if (!isDateDisabled(today)) {
                  onDateChange(today);
                  handleClose();
                }
              }}
              className="flex-1 px-3 py-1.5 text-sm font-medium text-[#F47B20] hover:bg-orange-50 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                if (!isDateDisabled(tomorrow)) {
                  onDateChange(tomorrow);
                  handleClose();
                }
              }}
              className="flex-1 px-3 py-1.5 text-sm font-medium text-[#F47B20] hover:bg-orange-50 rounded-lg transition-colors"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleClose()}
              className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
