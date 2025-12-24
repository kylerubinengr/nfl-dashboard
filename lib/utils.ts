export const formatGameTime = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short', // "Sun"
    month: 'short',   // "Dec"
    day: 'numeric',   // "31"
    hour: 'numeric',  // "1"
    minute: '2-digit', // "00"
    hour12: true      // "PM"
  }).format(date);
};