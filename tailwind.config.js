/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.ts",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
                display: ['"DM Serif Display"', 'Georgia', 'serif'],
            },
            colors: {
                stone: {
                    50: '#f6f6f5',
                    100: '#efefec',
                    200: '#e3e3df',
                    300: '#cfcfc8',
                    400: '#b3b3a9',
                    500: '#9b9b8f',
                    600: '#828276',
                    700: '#6b6b61',
                    800: '#585850',
                    900: '#111111',
                }
            },
            boxShadow: {
                'soft': '0 4px 24px -6px rgba(0, 0, 0, 0.03)',
                'float': '0 8px 32px -8px rgba(0, 0, 0, 0.08)',
                'modal': '0 24px 48px -12px rgba(0, 0, 0, 0.15)',
            }
        }
    },
    plugins: [],
}
