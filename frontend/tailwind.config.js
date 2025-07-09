/** @type {import('tailwindcss').Config} */
// Enables type support and IntelliSense in editors like VSCode

export default { //Makes your config available to Tailwind’s compiler during build
  // Paths to all of your files that use Tailwind CSS classes
  content: [
    './index.html',                       // Entry HTML file
    './src/**/*.{vue,js,ts,jsx,tsx}'      // All Vue, JS, and TS files in src (recursive)
  ],

  theme: {
    // Extend Tailwind's default design system
    extend: {
      // Example: Add a custom color
      // colors: {
      //   brand: '#1e40af',
      // },

      // Example: Add a custom font family
      // fontFamily: {
      //   sans: ['Inter', 'sans-serif'],
      // },

      // Example: Add custom spacing scale
      // spacing: {
      //   '128': '32rem',
      // },
    },
  },

  // Tailwind plugins to enhance styling (optional)
  plugins: [
    // Example: Add plugin for better typography
    // require('@tailwindcss/typography'),

    // Example: Add plugin for forms
    // require('@tailwindcss/forms'),
  ],

  // 🌙 Dark mode config
  // 'class' means you control dark mode using a .dark class (recommended for apps)
  // You must manually add/remove the class (e.g. on <html>)
  //
  // Example:
  // document.documentElement.classList.add('dark')  // Enable dark mode
  // document.documentElement.classList.remove('dark') // Disable dark mode
  darkMode: 'class',
};

















