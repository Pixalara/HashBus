export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  // Remove timezone info and treat as IST
  const dateOnly = dateString.split('T')[0] || dateString;
  const date = new Date(dateOnly + 'T00:00:00'); // Add time to avoid TZ issues
  
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatTime = (timeOrTimestamp: string): string => {
  // If already formatted as time, return as-is
  if (timeOrTimestamp.includes('AM') || timeOrTimestamp.includes('PM')) {
    return timeOrTimestamp;
  }

  // Handle full timestamp (ISO format with T or space separator)
  if (timeOrTimestamp.includes('T') || timeOrTimestamp.includes(' ')) {
    // Extract just the time part (HH:MM:SS or HH:MM)
    const timePart = timeOrTimestamp.includes('T') 
      ? timeOrTimestamp.split('T')[1] 
      : timeOrTimestamp.split(' ')[1];
    
    if (timePart) {
      // Parse time without timezone conversion
      const [hours, minutes] = timePart.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
    }
  }

  // Handle time-only string (HH:MM or HH:MM:SS)
  if (timeOrTimestamp.includes(':')) {
    const [hours, minutes] = timeOrTimestamp.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
  }

  return timeOrTimestamp;
};

export const generateBookingId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `HB${timestamp}${random}`.toUpperCase();
};