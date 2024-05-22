# react-native-simple-carousel

A simple carousel for React native app

![](https://github.com/nguyentc21/react-native-simple-carousel/assets/react-native-simple-carousel.gif)

## Installation

```sh
yarn add @nguyentc21/react-native-simple-carousel
```

## Usage

```tsx
import Carousel from '@nguyentc21/react-native-simple-carousel';

const DATA = [
  { uri: 'https://...... ... ... image1.png' },
  { uri: 'https://...... ... ... image2.png' },
];
// ...
export function NiceView(props: Props) {
  const carouselRef = useRef();
  // ...
  return (
    <>
      {/* ... */}
      <Carousel
        ref={carouselRef}
        data={DATA}
        width={300}
        height={150}
        autoPlay
        // playInvert
        loop
        // initialIndex={0}
        // hideIndicator
        // indicatorSize={10}
        duration={5000}
        // onChangeIndex={(index) => {
        //   // do something
        // }}
      />
      {/* ... */}
      <Button
        onPress={() => {
          carouselRef.current?.toPrev();
        }}
      >
        Prev
      </Button>
      <Button
        onPress={() => {
          carouselRef.current?.toNext();
        }}
      >
        Next
      </Button>
      {/* ... */}
    </>
  );
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
