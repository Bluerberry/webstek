
type Theme = 'light' | 'dark'
const theme = $state({
	value: 'light' as Theme,
	invert: () => theme.value === 'light' ? 'dark' : 'light'
})

export default theme