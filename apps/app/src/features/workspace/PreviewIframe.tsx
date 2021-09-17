import React from 'react';
import { IFRAME_ORIGIN } from 'src/config';
import { useEditorActions } from './editor/EditorModule';
import { useWebNavigatorActions } from './WebNavigator';

export function PreviewIframe() {
  const { registerPreviewIFrame } = useEditorActions();
  const iframeRef = React.useRef(null! as HTMLIFrameElement);
  const { registerIframe } = useWebNavigatorActions();

  React.useEffect(() => {
    registerPreviewIFrame(iframeRef.current);
    registerIframe(iframeRef.current);
  }, []);

  return (
    <iframe
      sandbox="allow-same-origin allow-modals allow-scripts allow-popups allow-forms"
      src={IFRAME_ORIGIN}
      ref={iframeRef}
      style={{ width: '100%', height: '100%' }}
    ></iframe>
  );
}
