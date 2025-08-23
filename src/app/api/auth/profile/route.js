import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/middlewares/requireAuth'
import { connectDB } from '@/lib/db'
import User from '@/lib/model/User'


async function handler(req) {
await connectDB()
const me = await User.findById(req.user.id).select('-password')
if (!me) return NextResponse.json({ message: 'Not found' }, { status: 404 })
return NextResponse.json(me)
}


export const GET = withAuth(handler)