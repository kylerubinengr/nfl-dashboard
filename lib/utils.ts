export const formatGameTime = (isoString: string) => {
  if (!isoString || isNaN(new Date(isoString).getTime())) {
    return 'TBD';
  }
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

export const getLogoUrl = (url: string | undefined | null): string => {
  const defaultLogo = 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png';
  if (!url || url.trim() === '') {
    return defaultLogo;
  }
  return url;
};
