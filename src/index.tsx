import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { View, Image, FlatList } from 'react-native';

import type { ReactNode } from 'react';
import type {
  ViewStyle,
  ImageStyle,
  ImageProps,
  StyleProp,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatListProps,
  ListRenderItem,
} from 'react-native';

type ItemData = ImageProps['source'];
type CarouselProps = {
  containerStyle?: StyleProp<ViewStyle>;
  data: ItemData[];
  width: number;
  height: number;
  autoPlay?: boolean;
  playInvert?: boolean;
  loop?: boolean;
  duration?: number;
  initialIndex?: number;

  sliderStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;

  hideIndicator?: boolean;
  indicatorContainerStyle?: StyleProp<ViewStyle>;
  indicatorStyle?: StyleProp<ViewStyle>;
  indicatorSize?: number;
  renderIndicator?(index: number, isActivated: boolean): ReactNode;

  onChangeIndex?(index: number): void;
};
type CarouselRefType = {
  toPrev(): void;
  toNext(): void;
};

const TAIL_SIZE = 2;

const useData = <T,>(props: { data: T[]; tailSize: number }) => {
  const { data, tailSize } = props;
  const [result, setResult] = useState<T[]>();
  useEffect(() => {
    if (data == undefined || data.length <= 0) {
      setResult([]);
    } else if (data.length === 1) {
      const _rs = new Array(tailSize * 2 + 1).fill(0).map(() => data[0] as T);
      setResult(_rs);
    } else {
      const leftTail = data.slice(-tailSize);
      const rightTail = data.slice(0, tailSize);
      setResult(leftTail.concat(data, rightTail));
    }
  }, [data]);
  return result;
};

const getInitialIndex = (props: CarouselProps) => {
  const { initialIndex } = props;
  return initialIndex != undefined ? initialIndex + TAIL_SIZE : TAIL_SIZE;
};

const Carousel = forwardRef<CarouselRefType, CarouselProps>((props, ref) => {
  const {
    containerStyle,
    data,
    width,
    height,
    autoPlay,
    playInvert,
    loop = true,
    duration = 5000,
    sliderStyle,
    imageStyle,
    hideIndicator,
    indicatorContainerStyle,
    indicatorStyle,
    indicatorSize = 10,
    renderIndicator,
    onChangeIndex,
  } = props;

  const flatListRef = useRef<FlatList>(null);
  const localData = useRef<{
    endScrollingTimeoutAction?: NodeJS.Timeout;
    timeoutLoopAction?: NodeJS.Timeout;
    isMomentumOrDragScrolling: boolean;
  }>({
    endScrollingTimeoutAction: undefined,
    timeoutLoopAction: undefined,
    isMomentumOrDragScrolling: false,
  });

  const [slideIndexState, setSlideIndexState] = useState(
    getInitialIndex(props)
  );
  const [currentIndexState, setCurrentIndexState] = useState(slideIndexState);
  const [isScrollingState, setIsScrollingState] = useState(false);
  const [isReadyState, setIsReadyState] = useState(false);

  const fData = useData({ data, tailSize: TAIL_SIZE });

  const selectedIndex = useMemo(() => {
    if (currentIndexState < TAIL_SIZE) {
      return currentIndexState + data.length;
    } else if (currentIndexState > data.length + TAIL_SIZE - 1) {
      return currentIndexState - data.length;
    } else {
      return currentIndexState;
    }
  }, [currentIndexState]);

  useEffect(() => {
    return () => {
      _clearEndScrollingTimeoutAction();
      _clearTimeoutLoopAction();
    };
  }, []);

  useEffect(() => {
    if (
      !autoPlay ||
      isScrollingState ||
      data.length < 2 ||
      (!loop &&
        selectedIndex ===
          (!playInvert ? data.length + TAIL_SIZE - 1 : TAIL_SIZE))
    ) {
      _clearTimeoutLoopAction();
      return;
    }
    if (!!isReadyState) {
      localData.current.timeoutLoopAction = setTimeout(() => {
        if (!playInvert) {
          _toNextSlide();
        } else {
          _toPrevSlide();
        }
        localData.current.timeoutLoopAction = undefined;
      }, duration);
    }
  }, [isReadyState, isScrollingState]);

  useEffect(() => {
    if (!isReadyState) return;
    if (slideIndexState < TAIL_SIZE) {
      const _index = slideIndexState + data.length;
      setSlideIndexState(_index);
      setCurrentIndexState(_index);
      flatListRef.current?.scrollToIndex({
        index: _index,
        animated: false,
        viewOffset: 0,
        viewPosition: 0,
      });
    } else if (slideIndexState > data.length + TAIL_SIZE - 1) {
      const _index = slideIndexState - data.length;
      setSlideIndexState(_index);
      setCurrentIndexState(_index);
      flatListRef.current?.scrollToIndex({
        index: _index,
        animated: false,
        viewOffset: 0,
        viewPosition: 0,
      });
    }
  }, [slideIndexState]);

  useEffect(() => {
    onChangeIndex?.(selectedIndex - TAIL_SIZE);
  }, [selectedIndex]);

  const _clearEndScrollingTimeoutAction = () => {
    if (localData.current.endScrollingTimeoutAction) {
      clearTimeout(localData.current.endScrollingTimeoutAction);
      localData.current.endScrollingTimeoutAction = undefined;
    }
  };
  const _clearTimeoutLoopAction = () => {
    if (localData.current.timeoutLoopAction) {
      clearTimeout(localData.current.timeoutLoopAction);
      localData.current.timeoutLoopAction = undefined;
    }
  };

  const _toPrevSlide = () => {
    if (isScrollingState) return;
    _clearEndScrollingTimeoutAction();
    setIsScrollingState(true);
    setCurrentIndexState((_currentIndexState) => {
      const nextIndex = _currentIndexState - 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
        viewOffset: 0,
        viewPosition: 0,
      });
      return nextIndex;
    });
  };
  const _toNextSlide = () => {
    if (isScrollingState) return;
    _clearEndScrollingTimeoutAction();
    setIsScrollingState(true);
    setCurrentIndexState((_currentIndexState) => {
      const nextIndex = _currentIndexState + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
        viewOffset: 0,
        viewPosition: 0,
      });
      return nextIndex;
    });
  };

  const _onBeginScrolling = () => {
    localData.current.isMomentumOrDragScrolling = true;
    setIsScrollingState(true);
    _clearEndScrollingTimeoutAction();
  };

  const _onEndScrollingDebounce = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    isNeedSetCurrentIndex: boolean,
    cb?: () => void
  ) => {
    _clearEndScrollingTimeoutAction();
    const { contentOffset } = e.nativeEvent;
    const targetIndex = Math.round(contentOffset.x / width);
    if (isNeedSetCurrentIndex) {
      setCurrentIndexState(targetIndex);
    }
    localData.current.endScrollingTimeoutAction = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewOffset: 0,
        viewPosition: 0,
      });
      cb?.();
      setSlideIndexState(targetIndex);
      setIsScrollingState(false);
      localData.current.endScrollingTimeoutAction = undefined;
    }, 100);
  };

  const _onMomentumScrollBegin = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    e.persist();
    _onBeginScrolling();
  };
  const _onScrollBeginDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    e.persist();
    _onBeginScrolling();
  };
  const _onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    e.persist();
    _onEndScrollingDebounce(e, true, () => {
      localData.current.isMomentumOrDragScrolling = false;
    });
  };
  const _onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    e.persist();
    _onEndScrollingDebounce(e, true, () => {
      localData.current.isMomentumOrDragScrolling = false;
    });
  };
  const _onScrollDebounce = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    e.persist();
    if (localData.current.isMomentumOrDragScrolling) return
    _onEndScrollingDebounce(e, false)
  }

  const _onImageLoadEnd = (index: number) => () => {
    if (index === getInitialIndex(props)) {
      setIsReadyState(true);
    }
  };

  const _getItemLayout: FlatListProps<ItemData>['getItemLayout'] = (
    _data,
    index
  ) => ({
    length: width,
    offset: width * index,
    index,
  });

  useImperativeHandle(ref, () => ({
    toNext: _toNextSlide,
    toPrev: _toPrevSlide,
  }));

  const _renderItem: ListRenderItem<ItemData> = ({ item, index }) => {
    return (
      <View
        style={[
          {
            width,
            height,
            paddingHorizontal: width * 0.01,
            overflow: 'hidden',
          },
          sliderStyle,
        ]}
      >
        <Image
          source={item}
          onLoadEnd={_onImageLoadEnd(index)}
          style={[
            { flex: 1, width: '100%', borderRadius: width * 0.04 },
            imageStyle,
          ]}
          resizeMode="cover"
        />
      </View>
    );
  };

  const _renderIndicatorItem = (_el: unknown, index: number) => {
    const isActivated = index === selectedIndex - TAIL_SIZE;
    if (renderIndicator) {
      return renderIndicator(index, isActivated);
    }
    return (
      <View
        key={index}
        style={[
          {
            marginHorizontal: indicatorSize * 0.5,
            width: indicatorSize,
            height: indicatorSize,
            backgroundColor: '#ffffff',
            borderRadius: indicatorSize,
            opacity: 0.3,
          },
          isActivated && { opacity: 0.7 },
          indicatorStyle,
        ]}
      />
    );
  };
  const _renderIndicatorSection = () => {
    if (!!hideIndicator) return null;
    return (
      <View
        style={[
          {
            flexDirection: 'row',
            position: 'absolute',
            bottom: '6%',
            alignSelf: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: indicatorSize * 0.5,
            borderRadius: indicatorSize,
          },
          indicatorContainerStyle,
        ]}
      >
        {data.map(_renderIndicatorItem)}
      </View>
    );
  };

  return (
    <View
      style={[
        {
          width: width,
          height: height,
        },
        containerStyle,
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={fData}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
        alwaysBounceHorizontal={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={slideIndexState}
        pagingEnabled
        disableIntervalMomentum
        horizontal
        onMomentumScrollBegin={_onMomentumScrollBegin}
        onMomentumScrollEnd={_onMomentumScrollEnd}
        onScrollBeginDrag={_onScrollBeginDrag}
        onScrollEndDrag={_onScrollEndDrag}
        onScroll={_onScrollDebounce}
        getItemLayout={_getItemLayout}
        renderItem={_renderItem}
        keyExtractor={(_item, index) => index.toString()}
        ListEmptyComponent={<View />}
      />
      {_renderIndicatorSection()}
    </View>
  );
});

export type { CarouselProps, CarouselRefType };
export default Carousel;
