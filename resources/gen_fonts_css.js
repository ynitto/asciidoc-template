const fs = require('fs');
const ospath = require('path');

let fontStylePath = 'fonts.css';
let fontsDirectoryPath = 'fonts';
switch (process.argv.length) {
case 0:
case 1:
case 2:
  break;
case 3:
  fontsDirectoryPath = process.argv[2];
  break;
default:
  fontStylePath = process.argv[2];
  fontsDirectoryPath = process.argv[3];
  break;
}

const fonts = fs.readdirSync(fontsDirectoryPath);

if (fonts.length == 0) {
  throw new Error('Not found fonts. Aborting...');
}

// generate the @font-face definitions from the fonts directory
const startTag = '/* start:font-face */';
const endTag = '/* end:font-face */';

const data = [];
data.push(startTag);

for (const font of fonts) {
  const fontPath = ospath.join(fontsDirectoryPath, font);
  const buff = fs.readFileSync(fontPath);

  let dataUriPrefix;
  let fontFormat;
  if (font.endsWith('.ttf')) {
    dataUriPrefix = 'data:font/truetype;charset=utf-8;base64,';
    fontFormat = 'truetype';
  } else if (font.endsWith('.otf')) {
    dataUriPrefix = 'data:font/opentype;charset=utf-8;base64,';
    fontFormat = 'opentype';
  } else if (font.endsWith('.woff2')) {
    dataUriPrefix = 'data:application/font-woff2;charset=utf-8;base64,';
    fontFormat = 'woff2';
  } else {
    continue;
  }

  const basename = ospath.basename(font, ospath.extname(font));
  const parts = basename.split('-');
  const fontType = parts[1];

  let fontWeight;
  if (fontType.startsWith('Thin')) {
    fontWeight = 100;
  } else if (fontType.startsWith('ExtraLight')) {
    fontWeight = 200;
  } else if (fontType.startsWith('Light')) {
    fontWeight = 300;
  } else if (fontType === 'Regular' || fontType === 'Italic') {
    fontWeight = 400;
  } else if (fontType.startsWith('Medium')) {
    fontWeight = 500;
  } else if (fontType.startsWith('SemiBold')) {
    fontWeight = 600;
  } else if (fontType.startsWith('Bold')) {
    fontWeight = 700;
  } else if (fontType.startsWith('ExtraBold')) {
    fontWeight = 800;
  } else if (fontType.startsWith('Black') || fontType.startsWith('Heavy')) {
    fontWeight = 900;
  } else {
    throw new Error('Unable to determine the font weight from the name. Aborting...');
  }

  let fontStyle = 'normal';
  if (fontType.includes('Italic')) {
    fontStyle = 'italic';
  }

  let unicodeRange = '';
//   if (font === 'DroidSansMono-Regular.woff2') {
//     unicodeRange = `  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
// `;
//   }

  const fontFamily = parts[0].split("_").join(' ');
  const fontBase64 = buff.toString('base64');
  const template = `@font-face {
  font-family: '${fontFamily}';
  font-style: ${fontStyle};
  font-weight: ${fontWeight};
  font-display: block;
  src: url(${dataUriPrefix}${fontBase64}) format('${fontFormat}');
${unicodeRange}}`;

  data.push(template);
}

data.push(endTag)

// Write fonts css file
fs.writeFileSync(fontStylePath, data.join('\n'), 'utf8');
