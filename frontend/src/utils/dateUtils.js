// Utility function to get current date in local timezone
// This avoids timezone issues with toISOString() which returns UTC
export const getCurrentLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Enhanced date formatting with timezone-aware current date detection
export const formatDateInfo = (dateString) => {
  try {
    if (!dateString || dateString === 'Invalid Date' || dateString === '') {
      return { formatted: 'Invalid Date', isToday: false };
    }
    
    // Clean the date string - remove time if present
    const cleanDateString = String(dateString).split(' ')[0];
    
    // Validate the date format (should be YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDateString)) {
      return { formatted: 'Invalid Date', isToday: false };
    }
    
    const date = new Date(cleanDateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return { formatted: 'Invalid Date', isToday: false };
    }
    
    const today = getCurrentLocalDate();
    const isToday = cleanDateString === today;
    
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return { 
      formatted: isToday ? `${formatted} (Today)` : formatted, 
      isToday 
    };
  } catch (error) {
    console.error('Date formatting error:', error);
    return { formatted: 'Invalid Date', isToday: false };
  }
};

// Helper function to format dates for display in UploadCard with detailed info
export const formatDisplayDate = (dateString) => {
  try {
    if (!dateString || dateString === 'Invalid Date' || dateString === '') {
      const today = getCurrentLocalDate();
      return {
        formatted: new Date(today).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        raw: today,
        isToday: true,
        note: 'Using current date'
      };
    }
    
    // Clean the date string
    const cleanDate = String(dateString).split(' ')[0];
    
    // Validate format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      const today = getCurrentLocalDate();
      return {
        formatted: new Date(today).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        raw: today,
        isToday: true,
        note: 'Invalid format - using current date'
      };
    }
    
    const date = new Date(cleanDate);
    if (isNaN(date.getTime())) {
      const today = getCurrentLocalDate();
      return {
        formatted: new Date(today).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        raw: today,
        isToday: true,
        note: 'Invalid date - using current date'
      };
    }
    
    const today = getCurrentLocalDate();
    const isToday = cleanDate === today;
    
    return {
      formatted: date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      raw: cleanDate,
      isToday,
      note: isToday ? 'Today' : 'From receipt'
    };
  } catch (error) {
    console.error('Date formatting error:', error);
    const today = getCurrentLocalDate();
    return {
      formatted: new Date(today).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      raw: today,
      isToday: true,
      note: 'Error - using current date'
    };
  }
};