import React from 'react';
import tw from 'twin.macro';
import { createCookie } from '../../common/cookie';
import { useGetter } from '../../hooks/useGetter';
import { useLayoutEffectFix } from '../../hooks/useLayoutEffectFix';
import {
  LEFT_COOKIE_NAME,
  LEFT_MIN,
  MAIN_MIN,
  RIGHT_COOKIE_NAME,
  RIGHT_MIN,
} from './const';
import { Resizer } from './Resizer';

interface LayoutManagerProps {
  initialLeftSidebar: number;
  initialRightSidebar: number;
  left: React.ReactNode;
  hasLeft: boolean;
  main: React.ReactNode;
  right: React.ReactNode;
  hasRight: boolean;
}

function saveLocalStorageSize(type: 'left' | 'right', value: number) {
  createCookie(
    type === 'left' ? LEFT_COOKIE_NAME : RIGHT_COOKIE_NAME,
    String(value)
  );
}

export function LayoutManager(props: LayoutManagerProps) {
  const {
    hasLeft,
    left,
    main,
    right,
    hasRight,
    initialLeftSidebar,
    initialRightSidebar,
  } = props;
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState({
    width: 0,
    height: 1280,
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const [leftSize, setLeftSize] = React.useState(initialLeftSidebar);
  const [rightSize, setRightSize] = React.useState(initialRightSidebar);
  const getLeftSize = useGetter(leftSize);
  const getRightSize = useGetter(rightSize);

  useLayoutEffectFix(() => {
    document.body.style.overflow = 'hidden';
    const onResize = () => {
      if (!ref.current) {
        return;
      }
      const width = document.body.clientWidth - ref.current.offsetLeft * 2;
      const mainSize = width - getLeftSize() - getRightSize();
      let sizeNeeded = MAIN_MIN - mainSize;
      if (sizeNeeded > 0) {
        const newLeftSize = Math.max(LEFT_MIN, getLeftSize() - sizeNeeded);
        sizeNeeded -= getLeftSize() - newLeftSize;
        const newRightSize = Math.max(RIGHT_MIN, getRightSize() - sizeNeeded);
        setLeftSize(newLeftSize);
        setRightSize(newRightSize);
      }
      setSize({
        width,
        height: ref.current.clientHeight,
      });
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('resize', onResize);
    };
  }, []);
  React.useEffect(() => {
    saveLocalStorageSize('left', leftSize);
  }, [leftSize]);
  React.useEffect(() => {
    saveLocalStorageSize('right', rightSize);
  }, [rightSize]);

  return (
    <div tw="flex flex-1 h-full relative" ref={ref}>
      <div
        css={[tw`h-full flex-shrink-0`, !hasLeft && tw`overflow-hidden`]}
        style={{ width: hasLeft ? leftSize : 0, height: size.height }}
      >
        {React.useMemo(() => left, [left])}
      </div>
      {hasLeft && (
        <Resizer
          type="left"
          x={leftSize}
          minWidth={LEFT_MIN}
          maxWidth={size.width - rightSize - MAIN_MIN}
          updateSize={setLeftSize}
        />
      )}
      <div
        tw="h-full flex-shrink-0 flex-1"
        style={{
          width:
            size.width - (hasLeft ? leftSize : 0) - (hasRight ? rightSize : 0),
          height: size.height,
        }}
      >
        {React.useMemo(() => main, [main])}
      </div>
      {hasRight && (
        <Resizer
          type="right"
          x={rightSize}
          minWidth={RIGHT_MIN}
          maxWidth={size.width - leftSize - MAIN_MIN}
          updateSize={setRightSize}
          onDragging={setIsDragging}
        />
      )}
      <div
        css={[tw`h-full flex-shrink-0`, !hasRight && tw`overflow-hidden`]}
        style={{
          width: hasRight ? rightSize : 0,
          height: size.height,
          pointerEvents: isDragging ? 'none' : undefined,
        }}
      >
        {React.useMemo(() => right, [right])}
      </div>
    </div>
  );
}
