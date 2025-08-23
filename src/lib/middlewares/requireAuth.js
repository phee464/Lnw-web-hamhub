import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'


export function withAuth(handler) {
return async (req, ctx) => {
const auth = req.headers.get('authorization') || ''
const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
const cookieToken = req.cookies.get?.('token')?.value
const decoded = verifyToken(token || cookieToken)
if (!decoded) {
return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}
req.user = decoded
return handler(req, ctx)
}
}