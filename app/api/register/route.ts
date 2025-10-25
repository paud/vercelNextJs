import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
//import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const { username, name, email, phone, password, turnstileToken } = body;

  // 1. 校验 turnstile token
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!turnstileToken || !secretKey) {
    return NextResponse.json({ message: "Human verification failed." }, { status: 400 });
  }
  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey || "",
      response: String(turnstileToken),
    }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    return NextResponse.json({ message: "Human verification failed." }, { status: 400 });
  }

  // 2. 校验邮箱唯一
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ message: "This email is already registered. Please use another email." }, { status: 400 });
  }
  // 3. 校验用户名唯一
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    return NextResponse.json({ message: "This username is already taken. Please choose another username." }, { status: 400 });
  }

  // 4. 密码加密
  //const hashedPassword = await bcrypt.hash(password, 10);

  // 5. 创建用户
  const user = await prisma.user.create({
    data: { username, name, email, phone: phone || undefined, password: password },
  });

  // 6. 创建英文欢迎通知
  await prisma.systemNotification.create({
    data: {
      userId: user.id,
      title: "Welcome!",
      content: "Thank you for registering. Enjoy our marketplace!",
      type: "welcome"
    }
  });

  return NextResponse.json({ message: "Registration successful.", user });
}
