
export type NavData = {
    label: string
    path?: string
    adminOnly?: boolean
    children?: NavData[]
}