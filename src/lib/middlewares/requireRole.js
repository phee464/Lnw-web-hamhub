import { NextResponse } from 'next/server'


export function withRole(role, handler) {
return async (req, ctx) => {
const user = req.user
if (!user || user.role !== role) {
return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
}
return handler(req, ctx)
}
}