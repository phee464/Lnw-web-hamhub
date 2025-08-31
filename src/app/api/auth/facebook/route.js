// src/app/api/auth/facebook/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/facebook/callback';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const mode = searchParams.get('mode') || 'login'; // login or register
    
    if (!code) {
      // ถ้าไม่มี code แสดงว่าเป็นการเริ่มต้น OAuth flow
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${FACEBOOK_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}&` +
        `scope=email,public_profile&` +
        `response_type=code&` +
        `state=${mode}`; // ส่ง mode ไปใน state
      
      return NextResponse.redirect(authUrl);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `client_secret=${FACEBOOK_APP_SECRET}&` +
      `redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}&` +
      `code=${code}`
    );

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Failed to get access token');
    }

    // Get user profile from Facebook
    const profileResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`);
    const profile = await profileResponse.json();

    if (profile.error) {
      throw new Error(profile.error.message);
    }

    // TODO: ตรวจสอบในฐานข้อมูลว่าผู้ใช้มีอยู่แล้วหรือไม่
    // สำหรับตัวอย่างนี้จะใช้ข้อมูลจำลอง
    
    const userData = {
      id: profile.id,
      email: profile.email,
      username: profile.name,
      picture: profile.picture?.data?.url,
      provider: 'facebook'
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
    console.error('Facebook OAuth Error:', error);
    
    // Redirect กลับไปยังหน้า login/register พร้อมข้อความผิดพลาด
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'oauth_failed');
    
    return NextResponse.redirect(redirectUrl.toString());
  }
}

export async function POST(request) {
  // Handle manual token verification if needed
  try {
    const { accessToken } = await request.json();
    
    // Verify Facebook access token
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
    const profile = await response.json();
    
    if (profile.error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const userData = {
      id: profile.id,
      email: profile.email,
      username: profile.name,
      picture: profile.picture?.data?.url,
      provider: 'facebook'
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
    console.error('Facebook POST Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}