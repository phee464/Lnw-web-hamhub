// src/app/api/auth/google/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const mode = searchParams.get('mode') || 'login'; // login or register
    
    if (!code) {
      // ถ้าไม่มี code แสดงว่าเป็นการเริ่มต้น OAuth flow
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `state=${mode}`; // ส่ง mode ไปใน state
      
      return NextResponse.redirect(authUrl);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    // TODO: ตรวจสอบในฐานข้อมูลว่าผู้ใช้มีอยู่แล้วหรือไม่
    // สำหรับตัวอย่างนี้จะใช้ข้อมูลจำลอง
    
    const userData = {
      id: profile.id,
      email: profile.email,
      username: profile.name,
      picture: profile.picture,
      provider: 'google'
    };

    // สร้าง JWT token
    const token = jwt.sign(
      userData, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Redirect กลับไปยังหน้าแรกพร้อมกับ token
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('success', mode === 'register' ? 'registered' : 'logged_in');
    
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Google OAuth Error:', error);
    
    // Redirect กลับไปยังหน้า login/register พร้อมข้อความผิดพลาด
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'oauth_failed');
    
    return NextResponse.redirect(redirectUrl.toString());
  }
}

export async function POST(request) {
  // Handle manual token verification if needed
  try {
    const { credential } = await request.json(); // For Google One Tap
    
    // Verify Google credential
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const userData = {
      id: data.sub,
      email: data.email,
      username: data.name,
      picture: data.picture,
      provider: 'google'
    };

    // TODO: บันทึกลงฐานข้อมูลหรือตรวจสอบผู้ใช้

    const token = jwt.sign(
      userData,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return NextResponse.json({ 
      success: true, 
      token,
      user: userData 
    });

  } catch (error) {
    console.error('Google POST Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}