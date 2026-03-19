
import type { FlowIntent } from '$scripts/types'
import { redirect } from '@sveltejs/kit'

export function startFlow(intent?: FlowIntent, destination?: string) {
	const params: Record<string, string> = {}
	if (intent !== undefined) params.intent = intent
	if (destination !== undefined) params.dest = destination

	return new URLSearchParams(params).toString()
}

export function getFlowDestination(url: URL, defaultLocation: string) {
	return url.searchParams.get('dest') ?? defaultLocation
}

export function getFlowIntent(url: URL, defaultIntent?: FlowIntent) {
	return (url.searchParams.get('intent') ?? defaultIntent) as FlowIntent | undefined
}

export function redirectToDestination(url: URL, status: number, defaultLocation: string) {
	redirect(status, getFlowDestination(url, defaultLocation))
}

export function redirectPreservingFlow(url: URL, status: number, location: string) {
	redirect(status, location + '?' + url.searchParams.toString())	
}