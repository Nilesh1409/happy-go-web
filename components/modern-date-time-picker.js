"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

export default function ModernDateTimePicker({
  label,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  minDate,
  showTimeAfterDate = false,
  isDropOff = false,
  pickupDate,
  pickupTime,
  onAutoAdjust, // Callback when auto-adjustment happens
  autoOpenDatePicker = false, // NEW
  autoOpenTimePicker = false, // NEW
  onTimeSelected, // NEW
  onDateSelected, // NEW
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth())
      : new Date()
  );
  const [mounted, setMounted] = useState(false);

  const datePickerRef = useRef(null);
  const timePickerRef = useRef(null);
  const dateButtonRef = useRef(null);
  const timeButtonRef = useRef(null);

  // Get current date and time
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  useEffect(() => {
    setMounted(true);

    // Set default dates if not already set
    if (!isDropOff && !selectedDate) {
      // Default pickup date to tomorrow
      onDateChange(tomorrow);
    } else if (isDropOff && !selectedDate && pickupDate) {
      // Default drop date to day after pickup date
      const defaultDropDate = new Date(pickupDate);
      defaultDropDate.setDate(pickupDate.getDate() + 1);
      onDateChange(defaultDropDate);
    }
  }, []);

  // // Auto-adjust drop-off date/time when pickup changes
  // useEffect(() => {
  //   if (isDropOff && pickupDate && selectedDate) {
  //     let needsAdjustment = false;
  //     let newDropDate = new Date(selectedDate);
  //     let newDropTime = selectedTime;

  //     // If drop date is before pickup date, adjust to pickup date
  //     if (selectedDate < pickupDate) {
  //       newDropDate = new Date(pickupDate);
  //       needsAdjustment = true;
  //     }

  //     // If same date and pickup time exists, check time validity
  //     if (
  //       newDropDate.toDateString() === pickupDate.toDateString() &&
  //       pickupTime
  //     ) {
  //       const pickupTimeMinutes = timeToMinutes(pickupTime);
  //       const minDropTimeMinutes = pickupTimeMinutes + 30; // Minimum 30 minutes gap

  //       if (!selectedTime || timeToMinutes(selectedTime) < minDropTimeMinutes) {
  //         // Find next available time slot
  //         newDropTime = findNextAvailableTime(minDropTimeMinutes);
  //         if (!newDropTime) {
  //           // No time available today, move to next day
  //           newDropDate.setDate(newDropDate.getDate() + 1);
  //           newDropTime = "05:00"; // First available time next day
  //         }
  //         needsAdjustment = true;
  //       }
  //     }

  //     if (needsAdjustment) {
  //       onDateChange(newDropDate);
  //       if (newDropTime) {
  //         onTimeChange(newDropTime);
  //       }

  //       // Notify parent about auto-adjustment
  //       if (onAutoAdjust) {
  //         onAutoAdjust({
  //           type: "drop-adjustment",
  //           newDate: newDropDate,
  //           newTime: newDropTime,
  //           reason:
  //             selectedDate < pickupDate
  //               ? "date-before-pickup"
  //               : "time-conflict",
  //         });
  //       }
  //     }
  //   }
  // }, [pickupDate, pickupTime, isDropOff]);

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const [hour, minute] = timeString.split(":").map(Number);
    return hour * 60 + minute;
  };

  // Helper function to convert minutes to time string
  const minutesToTime = (minutes) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // Find next available time slot after given minutes
  const findNextAvailableTime = (minMinutes) => {
    // Round up to next 30-minute slot
    const roundedMinutes = Math.ceil(minMinutes / 30) * 30;

    // Check if within operating hours (5:00 AM to 10:30 PM)
    if (roundedMinutes <= 22 * 60 + 30) {
      return minutesToTime(roundedMinutes);
    }

    return null; // No available time today
  };

  // Calculate late dropoff charges
  const getLateDropoffCharge = (timeString) => {
    const [hour, minute] = timeString.split(":").map(Number);
    const timeInMinutes = hour * 60 + minute;

    if (timeInMinutes >= 20 * 60 + 30 && timeInMinutes < 21 * 60) return 50;
    if (timeInMinutes >= 21 * 60 && timeInMinutes < 21 * 60 + 30) return 100;
    if (timeInMinutes >= 21 * 60 + 30 && timeInMinutes < 22 * 60) return 150;
    if (timeInMinutes >= 22 * 60 && timeInMinutes < 22 * 60 + 30) return 200;
    if (timeInMinutes >= 22 * 60 + 30) return 300;

    return 0;
  };

  // Generate time slots based on selected date
  const generateTimeSlots = (selectedDate) => {
    const slots = [];
    const isToday =
      selectedDate && selectedDate.toDateString() === today.toDateString();
    const isSameDayAsPickup =
      isDropOff &&
      pickupDate &&
      selectedDate &&
      selectedDate.toDateString() === pickupDate.toDateString();

    let startHour = 5;
    let startMinute = 0;

    // For pickup on today
    if (!isDropOff && isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      if (currentHour < 5) {
        startHour = 5;
        startMinute = 0;
      } else {
        // Round up to next 30-minute slot
        if (currentMinute < 30) {
          startHour = currentHour;
          startMinute = 30;
        } else {
          startHour = currentHour + 1;
          startMinute = 0;
        }
      }

      if (startHour > 22 || (startHour === 22 && startMinute > 30)) {
        return [];
      }
    }

    // For drop-off on same day as pickup
    if (isDropOff && isSameDayAsPickup && pickupTime) {
      const pickupTimeMinutes = timeToMinutes(pickupTime);
      const minDropTimeMinutes = pickupTimeMinutes + 30;

      // Round up to next 30-minute slot
      const roundedMinutes = Math.ceil(minDropTimeMinutes / 30) * 30;
      startHour = Math.floor(roundedMinutes / 60);
      startMinute = roundedMinutes % 60;

      if (startHour > 22 || (startHour === 22 && startMinute > 30)) {
        return [];
      }
    }

    // Generate time slots
    for (let hour = startHour; hour <= 22; hour++) {
      const startMin = hour === startHour ? startMinute : 0;

      for (let minute = startMin; minute < 60; minute += 30) {
        if (hour === 22 && minute > 30) break;

        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const isEarlyMorning = hour >= 5 && hour < 7;
        const lateDropoffCharge = getLateDropoffCharge(timeString);
        // : 0;

        slots.push({
          value: timeString,
          label: formatTime(timeString),
          isEarlyMorning: isEarlyMorning,
          lateDropoffCharge,
        });
      }
    }
    return slots;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hour, minute] = timeString.split(":");
    const hourNum = Number.parseInt(hour);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour =
      hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const formatDate = (date) => {
    if (!date) return "Select Date";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;

    // For pickup: can't select dates before today
    if (!isDropOff) {
      return date < today;
    }

    // For drop-off: can't select dates before pickup date
    if (isDropOff && pickupDate) {
      return date < pickupDate;
    }

    // If minDate is provided, respect it
    if (minDate && date < minDate) return true;

    return false;
  };

  const handleDateSelect = (date) => {
    if (isDropOff && pickupDate) {
      // Auto-adjust logic for drop-off date selection
      let adjustedDate = new Date(date);
      let adjustedTime = selectedTime;
      let needsTimeAdjustment = false;

      // If selected date is same as pickup date, ensure time is valid
      if (
        adjustedDate.toDateString() === pickupDate.toDateString() &&
        pickupTime
      ) {
        const pickupTimeMinutes = timeToMinutes(pickupTime);
        const minDropTimeMinutes = pickupTimeMinutes + 30;

        if (!selectedTime || timeToMinutes(selectedTime) < minDropTimeMinutes) {
          adjustedTime = findNextAvailableTime(minDropTimeMinutes);
          if (!adjustedTime) {
            // No time available on same day, move to next day
            adjustedDate.setDate(adjustedDate.getDate() + 1);
            adjustedTime = "05:00";
          }
          needsTimeAdjustment = true;
        }
      }

      onDateChange(adjustedDate);
      if (needsTimeAdjustment && adjustedTime) {
        onTimeChange(adjustedTime);
      }

      if (
        onAutoAdjust &&
        (adjustedDate.getTime() !== date.getTime() || needsTimeAdjustment)
      ) {
        onAutoAdjust({
          type: "date-selection-adjustment",
          originalDate: date,
          newDate: adjustedDate,
          newTime: adjustedTime,
          reason: "time-conflict-on-same-day",
        });
      }
    } else {
      onDateChange(date);
    }

    setShowDatePicker(false);
    if (showTimeAfterDate) {
      setTimeout(() => setShowTimePicker(true), 100);
    }

    if (onDateSelected) {
      onDateSelected(date);
    }

    if (showTimeAfterDate) {
      setTimeout(() => setShowTimePicker(true), 100);
    }
  };

  const handleTimeSelect = (timeValue) => {
    onTimeChange(timeValue);
    setShowTimePicker(false);
    if (onTimeSelected) {
      onTimeSelected(timeValue);
    }
  };

  const handleDatePickerToggle = () => {
    setShowDatePicker(!showDatePicker);
    setShowTimePicker(false);
  };

  const handleTimePickerToggle = () => {
    if (selectedDate) {
      setShowTimePicker(!showTimePicker);
      setShowDatePicker(false);
    }
  };

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target) &&
        !dateButtonRef.current?.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target) &&
        !timeButtonRef.current?.contains(event.target)
      ) {
        setShowTimePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-open date picker
  useEffect(() => {
    if (autoOpenDatePicker) {
      setShowDatePicker(true);
      setShowTimePicker(false);
    }
  }, [autoOpenDatePicker]);

  // Auto-open time picker
  useEffect(() => {
    if (autoOpenTimePicker) {
      setShowTimePicker(true);
      setShowDatePicker(false);
    }
  }, [autoOpenTimePicker]);

  const timeSlots = generateTimeSlots(selectedDate);
  const daysInMonth = getDaysInMonth(currentMonth);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Dropdown component that uses getBoundingClientRect for positioning
  const DropdownPortal = ({ isOpen, buttonRef, children, className = "" }) => {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
      const updatePosition = () => {
        if (isOpen && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setPosition({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
            width: rect.width,
          });
        }
      };

      if (isOpen) {
        updatePosition();

        const handleScroll = () => updatePosition();
        const handleResize = () => updatePosition();

        // Add event listeners
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);
        document.addEventListener("scroll", handleScroll, true);

        return () => {
          window.removeEventListener("scroll", handleScroll, true);
          window.removeEventListener("resize", handleResize);
          document.removeEventListener("scroll", handleScroll, true);
        };
      }
    }, [isOpen, buttonRef]);

    if (!isOpen || !mounted) return null;

    return createPortal(
      <div
        className={`absolute bg-white border border-gray-200 rounded-lg shadow-2xl z-[99999] ${className}`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          minWidth: `${Math.max(position.width, 250)}px`,
          maxWidth: `${Math.max(position.width, 250)}px`,
        }}
      >
        {children}
      </div>,
      document.body
    );
  };

  return (
    <>
      <div className="space-y-2 relative">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Date Picker */}
          <div className="relative">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#F47B20] z-10" />
              <Button
                ref={dateButtonRef}
                type="button"
                variant="outline"
                className="w-full justify-start pl-10 pr-4 py-2 h-11 text-left font-normal border-gray-300 hover:border-[#F47B20] focus:border-[#F47B20] focus:ring-[#F47B20]"
                onClick={handleDatePickerToggle}
              >
                <span
                  className={selectedDate ? "text-gray-900" : "text-gray-500"}
                >
                  {formatDate(selectedDate)}
                </span>
              </Button>
            </div>
          </div>

          {/* Time Picker */}
          <div className="relative">
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#F47B20] z-10" />
              <Button
                ref={timeButtonRef}
                type="button"
                variant="outline"
                className="w-full justify-start pl-10 pr-4 py-2 h-11 text-left font-normal border-gray-300 hover:border-[#F47B20] focus:border-[#F47B20] focus:ring-[#F47B20]"
                onClick={handleTimePickerToggle}
                disabled={!selectedDate}
              >
                <span
                  className={selectedTime ? "text-gray-900" : "text-gray-500"}
                >
                  {selectedTime ? formatTime(selectedTime) : "Select Time"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Charges Notice */}
        {selectedTime && (
          <>
            {!isDropOff &&
              selectedTime >= "05:00" &&
              selectedTime < "07:00" && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  ⚠️ Early pickup charge: ₹100 extra (5 AM - 7 AM)
                </div>
              )}
            {isDropOff && getLateDropoffCharge(selectedTime) > 0 && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                ⚠️ Late dropoff charge: ₹{getLateDropoffCharge(selectedTime)}{" "}
                extra
              </div>
            )}
          </>
        )}
      </div>

      {/* Date Picker Dropdown */}
      <DropdownPortal
        isOpen={showDatePicker}
        buttonRef={dateButtonRef}
        className="p-4 min-w-[320px] max-w-[400px]"
      >
        <div ref={datePickerRef}>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1
                  )
                )
              }
              className="p-1 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="font-semibold text-gray-900 text-center flex-1">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1
                  )
                )
              }
              className="p-1 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((date, index) => (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="sm"
                disabled={!date || isDateDisabled(date)}
                onClick={() => date && handleDateSelect(date)}
                className={`
                  h-8 w-8 p-0 text-sm hover:bg-[#F47B20] hover:text-white transition-colors
                  ${!date ? "invisible" : ""}
                  ${
                    selectedDate &&
                    date &&
                    date.toDateString() === selectedDate.toDateString()
                      ? "bg-[#F47B20] text-white"
                      : ""
                  }
                  ${
                    date && date.toDateString() === today.toDateString()
                      ? "ring-2 ring-[#F47B20] ring-opacity-50"
                      : ""
                  }
                  ${isDateDisabled(date) ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {date?.getDate()}
              </Button>
            ))}
          </div>
        </div>
      </DropdownPortal>

      {/* Time Picker Dropdown */}
      <DropdownPortal
        isOpen={showTimePicker}
        buttonRef={timeButtonRef}
        className="max-h-64 overflow-y-auto"
      >
        <div ref={timePickerRef}>
          {timeSlots.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              No available time slots for selected date
            </div>
          ) : (
            timeSlots.map((slot) => (
              <Button
                key={slot.value}
                type="button"
                variant="ghost"
                className={`
                  w-full justify-between px-4 py-3 text-left hover:bg-[#F47B20] hover:text-white rounded-none transition-colors
                  ${selectedTime === slot.value ? "bg-[#F47B20]" : ""}
                  ${
                    slot.isEarlyMorning || slot.lateDropoffCharge > 0
                      ? "bg-red-50"
                      : ""
                  }
                `}
                onClick={() => handleTimeSelect(slot.value)}
              >
                <span>{slot.label}</span>
                {slot.isEarlyMorning && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    +₹100
                  </span>
                )}
                {slot.lateDropoffCharge > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    +₹{slot.lateDropoffCharge}
                  </span>
                )}
              </Button>
            ))
          )}
        </div>
      </DropdownPortal>
    </>
  );
}
