const config = {
    content: [
        "./src/**/*.{html,js,svelte,ts}",
        "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
    ],

    plugins: [
        require("postcss-nesting"),
        require("flowbite/plugin"),
        require("@tailwind-plugin/expose-colors")({
            extract: ["primary"],
        }),
    ],

    darkMode: "class",

    theme: {
        extend: {
            colors: {
                border: "var(--color-border)",
                primary: {
                    bg: "#202736",
                    "50": "#f8fafc",
                    "100": "#f1f5f9",
                    "200": "#e2e8f0",
                    "300": "#cbd5e1",
                    "400": "#94a3b8",
                    "500": "#64748b",
                    "600": "#475569",
                    "700": "#334155",
                    "800": "#1e293b",
                    "900": "#0f172a",
                },
            },
        },
    },
};

module.exports = config;
