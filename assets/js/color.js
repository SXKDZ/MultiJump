const toRGB = color => ((1 << 24) + color).toString(16).slice(1).match(/.{2}/g).map(x => parseInt(x, 16))
const toHex = color => '#' + ((1 << 24) + color).toString(16).slice(1)
const getBrightness = color => this.toRGB(color).reduce((s, x, i) => s + x * [0.3, 0.6, 0.1][i], 0) / 255.0

module.exports = {
  white: 0xffffff,
  lightGray: 0xdddddd,
  gray: 0x909090,
  darkGray: 0x404040,
  black: 0x000000,
  red: 0xff4444,
  yellow: 0xffff00,
  blue: 0x6cbdff,
  darkBlue: 0x203d6b,

  list: 'f44336e91e639c27b0673ab73f51b52196f303a9f400bcd40096884caf508bc34acddc39ffeb3bffc107ff9800ff57227955489e9e9e607d8b'.match(/.{6}/g).map(x => parseInt('0x' + x, 16)),

  toRGB,
  toHex,
  getBrightness
}
