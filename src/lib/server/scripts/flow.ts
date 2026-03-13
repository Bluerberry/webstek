
import type { FlowIntent } from '$lib/types'
import { redirect } from '@sveltejs/kit'

export function setFlow(url: URL, intent?: FlowIntent, destination?: string) {
	if (intent === undefined) {
		url.searchParams.delete('intent')
	} else {
		url.searchParams.set('intent', intent)
	}

	if (destination === undefined) {
		url.searchParams.delete('dest')
	} else {
		url.searchParams.set('dest', destination)
	}
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