
import { z } from 'zod'
import { error } from '@sveltejs/kit'
import { command } from '$app/server'
import { getRequestEvent } from '$app/server'
import { Verification } from '$server/services'
import { EMAIL_VERIFICATION_COOLDOWN_MS, generateCode, hashToken } from '$server/scripts/auth'
import { sendEmail, emailVerificationTemplate, emailUpdateVerificationTemplate } from '$server/scripts/email'

export const requestCode = command(z.string().optional(), async intent => {
    const { locals } = getRequestEvent()
    const now = Date.now()

    // Get User
    if (locals.user === undefined) {
        throw error(401, 'Unauthorized')
    }

    // Check cooldown
    const existing = await Verification.getByUserId(locals.user.id)

    if (existing) {
        const age = now - existing.createdAt.getTime()
        if (age < EMAIL_VERIFICATION_COOLDOWN_MS) {
            return existing.createdAt.getTime() + EMAIL_VERIFICATION_COOLDOWN_MS
        }

        await Verification.deleteAllByUserId(locals.user.id)
    }

    // Send new code
    const code = generateCode()
    const verification = await Verification.create(locals.user.id, await hashToken(code))
    const template = intent === 'update'
        ? emailUpdateVerificationTemplate(locals.user.username, code)
        : emailVerificationTemplate(locals.user.username, code)

    sendEmail(locals.user.email, 'Webstek - Verify your email', template)
    return verification.createdAt.getTime() + EMAIL_VERIFICATION_COOLDOWN_MS
})