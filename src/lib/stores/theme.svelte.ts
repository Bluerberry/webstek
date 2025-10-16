
type Theme = 'light' | 'dark';

const theme = $state<{ value: Theme }>({
	value: 'light'
});

export default theme;