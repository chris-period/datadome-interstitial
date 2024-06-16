# Overview
Generates a pseudo-random payload based on a given set of keys and values

### Constants
- **_hsv**: Included in the payload (`window._hsv`)
- **datadomeCID**: Used to create the `interstitialSeed`.
- **websiteHash**: Also used for the `interstitialSeed`.
- **interstitialSeed**: A hardcoded seed value for `pseudo-random number generation`.


### Time and Random Values
- **currentTime**: The current timestamp.
- **randomValue1**: `Math.floor(Math.random() * 1000)`.
- **randomValue2**: `Math.floor(Math.random() * 1000)`.
- **initialTime**: Initialized with the current time.

### Functions
`hashString(string)`
A function that generates a hash value for a given string.

- Input: A string.
- Output: A hashed integer.


`createHash(cid, sitehash)`
A function that combines the hashed client ID, website hash, current time, random values, and the interstitial seed to create a unique hash.

- Input: Client ID and website hash.
- Output: A unique hash integer.

`determineNumber(n)`
A function that maps a number to a specific value based on the input.

- Input: A number.
- Output: A mapped number.

`buildPayload(timeByte)`
A function that constructs the final payload string.

- Input: A time byte.
- Output: A string representing the payload.

### Classes
`PseudoRandom`
A class that generates pseudo-random bytes based on a seed and timestamp.

- Constructor: Initializes the timeByte and seed.
- getByte(): Generates and returns a pseudo-random byte.
- xorValues(charCodesRaw): XOR's characodes with a psuedo-random byte
- addSignal(itemKey, itemValue): Adds psuedo-random bytes to Bytes and calls xorValues


### Global Arrays
- keys: Stores XORed keys.
- values: Stores XORed values.
- bytes: Stores pseudo-random bytes used in XOR operations.
- bytesUsedForXor: Stores bytes used in XOR operations for keys and values.


### Usage
```js
const xx = [
  ['v', '1.11.4'],
  ['fm', false],
  ['wgPCM', 'bgra8unorm'],
  ['tagpu', 6.2999999998137355],
  ['dp0', true],
  ['aco', 'probably'],
  ['acots', false],
  ['acmp', 'probably'],
  ['acmpts', true],
  ['acw', 'probably'],
  ['acwts', false]
];

xx.forEach(item => {
  addSignal(item[0], item[1]);
});

const payload = buildPayload(psuedo.timeByte);
console.log(payload);
```

# Output
The payload used for datadome interstitial;
