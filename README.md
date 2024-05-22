# react-native-simple-carousel

A simple carousel for React native app

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
  // ...
  return (
    <>
      {/* ... */}
      <Carousel
        data={DATA}
        width={300}
        height={150}
        autoPlay
        loop
        duration={5000}
      />
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
