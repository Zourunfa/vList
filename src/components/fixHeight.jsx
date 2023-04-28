import React,{useState, useCallback, useRef, useEffect} from 'react'
import useFixedHeightVirtualList from '../hooks/fixHeightHook'
import '../App.css'

export default function FixHeight({data,itemHeight,itemRender}) {
  const [scrollTop, setScrollTop] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)

  const { totalHeight, visibleData, offset } = useFixedHeightVirtualList({
    data,
    itemHeight,
    scrollTop,
    clientHeight,
  })

  const containerRef = useRef(null);
  const scrollTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearInterval(scrollTimerRef.current);
      }
    };
  }, []);
  const handleScroll = useCallback(
    (event) => {
      if (containerRef.current) {
        // 取消之前的计时器
        if (scrollTimerRef.current) {
          clearInterval(scrollTimerRef.current);
        }

        // 缓动滚动，50ms 执行一次
        const { scrollTop: prevScrollTop } = containerRef.current;
        const { scrollTop: targetScrollTop } = event.target;
        const distance = targetScrollTop - prevScrollTop;

        let duration = 500;
        let currentDuration = 0;
        const stepFn = () => {
          currentDuration += 50;
          const nextScrollTop = Math.easeInOutQuad(
            currentDuration,
            prevScrollTop,
            distance,
            duration
          );

          if (currentDuration >= duration) {
            // 到达最终位置后，清除计时器
            clearInterval(scrollTimerRef.current);
            scrollTimerRef.current = null;
          }
          containerRef.current.scrollTop = nextScrollTop;
        };

        scrollTimerRef.current = setInterval(stepFn, 50);

        // 更新 scrollTop
        setScrollTop(targetScrollTop);
      }
    },
    []
  );


  const containerRefCallback = useCallback(
    (node) => {
      if (node) {
        containerRef.current = node;
        // 添加占位符，高度与容器高度一致
        node.style.height = `${clientHeight}px`;
      } else {
        containerRef.current = null;
      }
    },
    [clientHeight]
  );

  return (
    <div className="container" ref={containerRefCallback} onScroll={handleScroll}>
      <div className="total-list" style={{ height: `${totalHeight}px` }} />
      <div className="visible-list" style={{ transform: `translateY(${offset}px)` }}>
        {visibleData.map((data) => (
          <div key={data.id} style={{ height: `${itemHeight}px` }}>
            {itemRender(data)}
          </div>
        ))}
      </div>
    </div>
  );
}
Math.easeInOutQuad = function (t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};
