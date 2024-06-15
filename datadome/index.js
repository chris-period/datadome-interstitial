const _hsv = 'window._hsv'
const datadomeCID = 'Datadome CID'
const websiteHash = 'Website Hash'
const interstitialSeed = 4046101435 // seed (hardcoded at-the-moment)

const currentTime = Date.now()
const randomValue1 = Math.floor(Math.random() * 1000)
const randomValue2 = Math.floor(Math.random() * 1000)
let initialTime = currentTime

const hashString = string => {
  if (!string) return 1789537805
  let t = 0
  for (let e = 0; e < string.length; e++) {
    t = (t << 5) - t + string.charCodeAt(e)
  }
  return t || 1789537805
}

const createHash = ((cid, sitehash) => {
  return (
    hashString(cid) ^
    (currentTime + randomValue1 + randomValue2 * 2) ^
    hashString(sitehash) ^
    interstitialSeed
  )
})(datadomeCID, websiteHash)

// Remade the system on how they generate bytes,
// Takes in count of timestamp and a timeByte
// Aswell as a seed created with hash and initial time
class PseudoRandom {
  constructor (createdHash) {
    initialTime += randomValue2
    initialTime += randomValue1 + randomValue2
    this.timeByte = Date.now() & 255
    this.seed = createdHash ^ initialTime
    this.currentStep = -1
  }

  getByte () {
    if (++this.currentStep > 2) {
      this.currentStep = 0
      this.seed = (function (o) {
        o ^= o << 13
        o ^= o >> 17
        o ^= o << 5
        return o
      })(this.seed)
    }

    const s = 16 - this.currentStep * 8

    let t = 0
    t |= this.timeByte << 24
    t |= this.timeByte << 16
    t |= this.timeByte << 8
    t |= this.timeByte << 0
    return ((t ^ this.seed) >> s) & 255
  }
}

const psuedo = new PseudoRandom(createHash)

const keys = []
const values = []
const bytes = []
const bytesUsedForXor = []

// For all char codes we getByte() and xor the charcode with it
function xorValues (charCodesRaw) {
  const charCodesXor = []
  const bytesXor = []

  for (let i = 0; i < charCodesRaw.length; i++) {
    const byte = psuedo.getByte()
    bytesXor.push(byte)
    charCodesXor.push(charCodesRaw[i] ^ byte)
  }

  bytesUsedForXor.push(bytesXor)
  return charCodesXor
}

// add correct formated keys, values to their keys,values arary
// add getByte() to bytes array before key and after key
function addSignal (itemKey, itemValue) {
  const key = JSON.stringify(itemKey)
  const value = JSON.stringify(itemValue)

  bytes.push(psuedo.getByte())
  keys.push(xorValues(key.split('').map(s => s.charCodeAt(0))))
  bytes.push(psuedo.getByte())
  values.push(xorValues(value.split('').map(s => s.charCodeAt(0))))
}

// Keys/Values used to generate the payload
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
]

xx.forEach(item => {
  addSignal(item[0], item[1])
})

// Used to calculated the value based on n
function determineNumber (n) {
  if (n > 37) return 59 + n
  else if (n > 11) return 53 + n
  else if (n > 1) return 46 + n
  else return 50 * n + 45
}

// Create the payload into a string
function buildPayload (timeByte) {
  const output = []

  /**
   * -  loop through all found keys
   * -  seperate = determine if its the first key
   *        - if so, we give it value of 123
   *        - else its value is 44
   *    push the first byte xor with seperate (this should always be 123 when idx is 0)
   *    push all xor'd values from keys[idx] (type number[]), spread vals into output
   *    push the second byte found after pointer 2*idx+1
   *    push all xor'd values from values[idx] (type number[]), spread vals into output
   */

  /**
        * mock example
        *    let keys = [[1, 2, 3], [7, 8, 9]];
        *    let values = [[4, 5, 6], [10, 11, 12]];
        *    let bytes = [11, 12, 13, 14, 15, 16];
        *    let output = [];
        *    for (let index = 0; index < keys.length; index++) {
        *        const seperate = 0 === index ? 123 : 44;
        *        const firstByte = bytes[2 * index];
        *        output.push(firstByte); // actual: seperate ^ firstByte
        *        output.push(...keys[index]);
        *        const secondByte = bytes[2 * index + 1];
        *        output.push(secondByte); // actual: 58 ^ firstByte
        *        output.push(...values[index]);
        *    };
        *    console.log(output);

        * - Terminal -
        * [11, 1, 2, 3, 12, 4, 5, 6, 13, 7, 8, 9, 14, 10, 11, 12]
    */
  for (let idx = 0; idx < keys.length; idx++) {
    // seperate = 123 { || 44 ,
    const seperate = 0 === idx ? 123 : 44
    output.push(seperate ^ bytes[2 * idx])
    output.push(...keys[idx])
    output.push(58 ^ bytes[2 * idx + 1])
    output.push(...values[idx])
  }

  let t = ''
  if (
    (typeof _hsv == 'string' && _hsv.length > 0) ||
    (typeof _hsv == 'number' && !isNaN(_hsv))
  ) {
    t = JSON.stringify(_hsv)
  }

  //   Create the ending signature, anti tamper detection (idk lol), we create an array []
  //   If output length is 0, we xor a open curly-bracket `{` or a comma `,` with getByte()
  //   We then concat/add the xor values of "r3n"
  //   Followed by a colon `:` character xor'd with getByte()
  //   If we have _hsv we xor the bytes of it and concat to the array.
  //   Lastly we add the final 125 ^ getByte() or end-curly-bracket `}` ^ getByte()
  const signature = [(output.length ? 44 : 123) ^ psuedo.getByte()].concat(
    xorValues([34, 114, 51, 110, 34]), // "r3n"
    58 ^ psuedo.getByte(),
    xorValues((t || '33').split('').map(s => s.charCodeAt(0))),
    125 ^ psuedo.getByte()
  )

  // spread signature to output
  output.push(...signature)

  return (function () {
    const finalPayload = []
    for (let t = 0; t < output.length; ) {
      const r =
        ((output[t++] ^ timeByte) << 16) |
        ((output[t++] ^ timeByte) << 8) |
        (output[t++] ^ timeByte)

      finalPayload.push(
        String.fromCharCode(determineNumber((r >> 18) & 63)),
        String.fromCharCode(determineNumber((r >> 12) & 63)),
        String.fromCharCode(determineNumber((r >> 6) & 63)),
        String.fromCharCode(determineNumber(63 & r))
      )
    }
    const i = output.length % 3
    if (i) finalPayload.length -= 3 - i
    return finalPayload.join('')
  })()
}

const payload = buildPayload(psuedo.timeByte)
console.log(payload)
