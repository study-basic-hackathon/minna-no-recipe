module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: {
            main: "#FE7210",
            sub: "#FE8C12",
          },
          yellow: "#FCBB15",
        },
      },
      backgroundImage: {
        search: "url('/bg-search.webp')",
      },
    },
  },
  plugins: [],
};