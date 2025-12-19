
type Theme = 'light' | 'dark'
const theme = $state({
	value: 'light',
	invert: () => theme.value === 'light' ? 'dark' : 'light'
})

export default theme