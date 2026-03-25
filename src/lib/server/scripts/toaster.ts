
export function showToast(locals: App.Locals, title: string, body?: string, duration: 'default' | 'dismiss' = 'default') {
    if (locals.toasts === undefined) locals.toasts = []
    locals.toasts.push({ title, body, duration })
}