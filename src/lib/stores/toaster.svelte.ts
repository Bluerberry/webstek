
import 'crypto'

type Toast = {
	id: string
	title: string
	body?: string
	timeoutId?: NodeJS.Timeout
}

const toaster = $state({
	queue: [] as Toast[],

	show: (title: string, body?: string, duration: 'default' | 'dismiss' = 'default') => {
		const id = crypto.randomUUID()
		const toast: Toast = { id, title, body }

		if (duration !== 'dismiss') {
			toast.timeoutId = setTimeout(() => {
				toaster.dismiss(id)
			}, 10000)
		}

		toaster.queue.push(toast)
	},

	dismiss: (id: string) => {
		const toast = toaster.queue.find(m => m.id === id)
		if (toast?.timeoutId) {
			clearTimeout(toast.timeoutId)
		}

		toaster.queue = toaster.queue.filter(m => m.id !== id)
	}
})

export default toaster