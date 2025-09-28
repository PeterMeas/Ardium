

function ThemeToggle({ isDark, setIsDark }) {
    function handleToggleTheme() {
    if (isDark) {
        document.body.classList.remove('dark-mode');
        setIsDark(false);
    } else {
        document.body.classList.add('dark-mode');
        setIsDark(true);
    }
}// button to call a function when clicked

return (
    <button onClick={handleToggleTheme} className="theme-toggle">
        {isDark ? "💡" : "🌚"}
    </button>
    );

}
export default ThemeToggle;

