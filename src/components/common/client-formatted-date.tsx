
'use client';

import { useState, useEffect } from 'react';

interface ClientFormattedDateProps {
  dateString: string;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  loadingText?: string;
}

export function ClientFormattedDate({ dateString, locale, options, loadingText = "..." }: ClientFormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>(loadingText);

  useEffect(() => {
    if (dateString) {
      try {
        const date = new Date(dateString);
        // Ensure options are provided, even if empty, to avoid undefined behavior with toLocaleDateString
        const effectiveOptions = options || {}; 
        setFormattedDate(date.toLocaleDateString(locale, effectiveOptions));
      } catch (e) {
        console.error("Error formatting date:", e);
        setFormattedDate(dateString); // Fallback to original string on error
      }
    } else {
      setFormattedDate(''); // Handle empty dateString
    }
  }, [dateString, locale, options, loadingText]);

  return <>{formattedDate}</>;
}
