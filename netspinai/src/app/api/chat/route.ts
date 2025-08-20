import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { ChatMessage } from '../../../types/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let conversationText = "";
    if (history && history.length > 0) {
      const recentHistory = history.slice(-10);
      conversationText = recentHistory
        .map((msg: ChatMessage) => `${msg.isUser ? 'Human' : 'Assistant'}: ${msg.text}`)
        .join('\n') + '\n';
    }
    
    const fullPrompt = conversationText + `Human: ${message}\nAssistant:`;
    
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error generating response' },
      { status: 500 }
    );
  }
}