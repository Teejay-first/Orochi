import { useState, useEffect } from 'react';

/**
 * Hook to detect which section is currently in view based on scroll position
 * @param sectionIds Array of section IDs to track
 * @param offset Offset from top of viewport to consider a section active
 * @returns The ID of the currently active section
 */
export function useScrollspy(sectionIds: string[], offset: number = 100): string {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;

      // Find the section that's currently in view (check from bottom to top)
      let currentSection = sectionIds[0];
      
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          
          // If we've scrolled past the top of this section, it's active
          if (scrollPosition >= sectionTop) {
            // But check if we haven't scrolled past the bottom yet
            if (scrollPosition < sectionBottom || i === sectionIds.length - 1) {
              currentSection = sectionIds[i];
              break;
            }
          }
        }
      }

      setActiveSection(currentSection);
    };

    // Initial check with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(handleScroll, 100);

    // Add scroll listener with throttling
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [sectionIds, offset]);

  return activeSection;
}

