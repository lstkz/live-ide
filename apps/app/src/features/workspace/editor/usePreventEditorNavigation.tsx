import { useRouter } from 'next/dist/client/router';
import React from 'react';

export function usePreventEditorNavigation(dirtyMap: Record<string, boolean>) {
  const unsavedChanges = React.useMemo(() => {
    return Object.values(dirtyMap).some(x => x);
  }, [dirtyMap]);
  const router = useRouter();
  React.useEffect(() => {
    const warningText =
      'You have unsaved changes - are you sure you wish to leave this page?';
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!unsavedChanges) return;
      e.preventDefault();
      return (e.returnValue = warningText);
    };
    const handleBrowseAway = () => {
      if (!unsavedChanges) return;
      if (window.confirm(warningText)) return;
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };
    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [unsavedChanges]);
}
