/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gate: {
                    green: '#28a745', // Answered
                    red: '#dc3545',   // Not Answered
                    purple: '#6f42c1',// Marked for Review
                    gray: '#e9ecef',  // Not Visited
                    blue: '#007bff',  // Selected
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
