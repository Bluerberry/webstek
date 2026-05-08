
import { User, DeletedUser } from '$server/services'
import { query } from '$app/server'
import z from 'zod'

const MAX_BUCKETS = 500

const userSignupSchema = z.object({
    since: z.number(),
    bucketCount: z.number().int().min(1).max(MAX_BUCKETS)
})

export const getUserSignup = query(userSignupSchema, async ({ since, bucketCount }) => {
    const now = Date.now()
    const sinceDate = new Date(since)
	
    // Query the database

    const [
        activeSignupCountBefore,
        deletedSignupCountBefore,
        activeSignups,
        deletedSignups,
        deletedUsers
    ] = await Promise.all([
        User.countBefore(sinceDate),
        DeletedUser.countBefore(sinceDate),
        User.getAllSince(sinceDate),
        DeletedUser.getCreatedSince(sinceDate),
        DeletedUser.getDeletedSince(sinceDate)
    ])

    // Prepare data
    const deleteTimestamps = deletedUsers.map(record => record.userDeletedAt.getTime())
    const createTimestamps: number[] = []

    let i = 0, j = 0
    while (i < activeSignups.length && j < deletedSignups.length) {
        const a = activeSignups[i].createdAt.getTime()
        const b = deletedSignups[j].userCreatedAt.getTime()

        if (a < b) {
            createTimestamps.push(a)
            i++
        } else {
            createTimestamps.push(b)
            j++
        }
    }

    while (i < activeSignups.length)
        createTimestamps.push(activeSignups[i++].createdAt.getTime())
    while (j < deletedSignups.length)
        createTimestamps.push(deletedSignups[j++].userCreatedAt.getTime())

    // Process data
    const bucketDuration = (since - now) / bucketCount
    const buckets = Array<number>(bucketCount)
    let threshold = since + bucketDuration

    i = 0, j = 0
    for (let b = 0; b < bucketCount; b++) {
        if (b === 0) {
            buckets[b] = activeSignupCountBefore + deletedSignupCountBefore
        } else {
            buckets[b] = buckets[b - 1]
        }

        threshold += bucketDuration

        while (i < createTimestamps.length && createTimestamps[i] < threshold) {
            buckets[b]++
            i++
        }

        while (j < deleteTimestamps.length && deleteTimestamps[j] < threshold) {
            buckets[b]--
            j++
        }
    }

    return buckets
})
