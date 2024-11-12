// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '450px',
      },
      backgroundImage: {},
      boxShadow: {},
      colors: {},
      padding: {
        7.5: '1.875rem', // 30px
        15: '3.75rem', // 60px
        18: '4.5rem', // 72px
        19: '4.75rem', // 76px
        6.5: '1.625rem', // 26px
        9.5: '1.625rem', // 40px
        21: '5.25rem', // 84px
      },
      spacing: {
        4.5: '1.125rem', // 18px
        6.5: '1.625rem', // 26px
        15: '3.75rem', // 60px
      },
      fontFamily: {
        montserrat: ['Montserrat', ...fontFamily.sans],
        openSans: ['OpenSans', ...fontFamily.sans],
        modernEra: ['ModernEra', ...fontFamily.sans],
        inter: ['Inter', ...fontFamily.sans],
        yeseva: ['Yeseva One', ...fontFamily.sans],
      },
      fontSize: {
        xxxs: ['0.625rem', '0.75rem'], // ['10px', '12px'],
        xxs: ['0.688rem', '1rem'], // ['11px', '16px'],
        xssm: ['0.813rem', '1.125rem'], // ['13px', '18px'],
        smbase: ['0.938rem', '1.25rem'], // ['15px', '20px'],
        baselg: ['1.05625rem', '1.375rem'], // ['17px', '22px'],
        lgxl: ['1.1875rem', '1.5rem'], // ['19px', '24px'],
        '1.75xl': ['1.375rem', '1.75rem'], // ['22px', '28px'],
        '2.25xl': ['1.625rem', '2rem'], // ['26px', '32px'],
        '2.5xl': ['1.75rem', '2.25rem'], // ['28px', '36px'],
        '2.75xl': ['1.875rem', '2.375rem'], // ['30px', '38px'],
        '3.25xl': ['2rem', '2.5rem'], // ['32px', '40px'],
        '4.1xl': ['2.375rem', '2.875rem'], // ['38px', '46px'],
        '4.5xl': ['2.5rem', '3rem'], // ['40px', '48px'],
      },
      gridTemplateColumns: {
        16: 'repeat(16, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-13': 'span 13 / span 13',
        'span-14': 'span 14 / span 14',
        'span-15': 'span 15 / span 15',
        'span-16': 'span 16 / span 16',
      },
      gridRow: {
        'span-13': 'span 13 / span 13',
        'span-14': 'span 14 / span 14',
        'span-15': 'span 15 / span 15',
        'span-16': 'span 16 / span 16',
      },
      width: {
        8.5: '2.125rem', // 34px
        9.5: '2.375rem', // 38px
        17: '4.25rem', // 68px
        18: '4.5rem', // 72px
        21: '5.25rem', // 84px
        22: '5.5rem', // 88px
        46.5: '11.625rem', // 186px
        66: '16.5rem', // 264px
        84: '21rem', // 336px
        86: '21.5rem', // 344px
        88: '22rem', // 352px
        92: '23rem', // 368px
        95: '23.75rem', // 380px
        98: '24.5rem', // 392px
        100: '25rem', // 400px
        102: '25.5rem', // 420px
        108: '27rem', // 432px
        110: '27.5rem', // 440px
        115: '28.75rem', // 460px
        159: '39.75rem', // 636px
        192: '48rem', // 768px
      },
      height: {
        8.5: '2.125rem', // 34px
        9.5: '2.375rem', // 38px
        18: '4.5rem', // 72px
        19: '4.75rem', // 76px
        21: '5.25rem', // 84px
        22: '5.5rem', // 88px
        27: '6.75rem', // 108px
        28: '7rem', // 112px
        30: '7.5rem', // 120px
        46: '11.5rem', // 184px
        46.5: '11.625rem', // 186px
        89: '22.25rem', // 356px
        115: '28.75rem', // 460px
        120: '30rem', // 480px
        145: '36.25rem', // 580px
        150: '37.5rem', // 600px
        '5.25/6': '87.5%',
        '5.5/6': '91.666667%',
        ...new Array(12)
          .fill(0)
          .reduce((acc, _, i) => ({ ...acc, [`${i + 1}/12`]: `${((i + 1) * 100) / 12}%` }), {}),
      },
      gap: {
        5.5: '1.375rem', // 22px
      },
      margin: {
        5.5: '1.375rem', // 22px
      },
      borderWidth: {
        px: '1px',
      },
      scale: {
        '-100': '-1',
      },
      animation: {
        'arrow-expand-right': 'arrow-expand-right 600ms infinite alternate',
      },
      inset: {
        7.5: '1.875rem', // 30px
        18: '4.5rem', // 72px
        21: '5.25rem', // 84px
      },
    },
  },
  plugins: [],
};
