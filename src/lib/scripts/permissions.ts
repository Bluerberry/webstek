
import type { 
    StrangerLocals, 
    UserLocals, 
    AdminLocals, 
    VerifiedLocals, 
    UnverifiedLocals,
} from '$scripts/types'

// ─── Checks ───────────────────────────────────────────────────────────────

export function isStranger(locals: App.Locals) : locals is StrangerLocals {
    return locals.user === undefined
}

export function isUser(locals: App.Locals): locals is UserLocals {
    return locals.user !== undefined
}

export function isAdmin(locals: App.Locals): locals is AdminLocals {
    return isUser(locals) && locals.user.role === 'admin'
}

export function isVerified(locals: App.Locals): locals is VerifiedLocals {
    return isUser(locals) && locals.user.verified
}

export function isUnverified(locals: App.Locals): locals is UnverifiedLocals {
    return isUser(locals) && !locals.user.verified
}
