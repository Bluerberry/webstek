
import 'crypto'

type Message = {
	id: string
	title: string
	body?: string
	timeoutId?: number
}

const toaster = $state({
	queue: [] as Message[],

	show: (title: string, body?: string, duration?: 'default' | 'dismiss') => {
		const id = crypto.randomUUID()
		const message: Message = { id, title, body }

		if (duration !== 'dismiss') {
			message.timeoutId = setTimeout(() => {
				toaster.dismiss(id)
			}, 10000) as unknown as number
		}

		toaster.queue.push(message)
	},

	dismiss: (id: string) => {
		const message = toaster.queue.find(m => m.id === id)
		if (message?.timeoutId) {
			clearTimeout(message.timeoutId)
		}

		toaster.queue = toaster.queue.filter(m => m.id !== id)
	}
})

export default toaster