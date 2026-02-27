import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIService {
  /**
   * Chat with AI assistant
   */
  static async chat(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: options?.model || 'gpt-4o-mini',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
      });

      const choice = response.choices[0];
      
      return {
        content: choice.message.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('AI chat error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Generate content based on prompt
   */
  static async generateContent(
    prompt: string,
    options?: {
      type?: 'blog' | 'email' | 'social' | 'general';
      tone?: 'professional' | 'casual' | 'friendly' | 'formal';
      length?: 'short' | 'medium' | 'long';
    }
  ): Promise<string> {
    const systemPrompts = {
      blog: 'You are a professional blog writer. Create engaging, SEO-friendly content.',
      email: 'You are an email copywriter. Write clear, concise, and effective emails.',
      social: 'You are a social media expert. Create engaging, shareable content.',
      general: 'You are a helpful content writer. Create clear and engaging content.',
    };

    const toneInstructions = {
      professional: 'Use a professional and business-appropriate tone.',
      casual: 'Use a casual and conversational tone.',
      friendly: 'Use a warm and friendly tone.',
      formal: 'Use a formal and respectful tone.',
    };

    const lengthInstructions = {
      short: 'Keep it brief, around 100-200 words.',
      medium: 'Write a moderate length piece, around 300-500 words.',
      long: 'Write a comprehensive piece, around 700-1000 words.',
    };

    const systemPrompt = systemPrompts[options?.type || 'general'];
    const toneInstruction = toneInstructions[options?.tone || 'professional'];
    const lengthInstruction = lengthInstructions[options?.length || 'medium'];

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `${systemPrompt} ${toneInstruction} ${lengthInstruction}`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await this.chat(messages);
    return response.content;
  }

  /**
   * Analyze data and provide insights
   */
  static async analyzeData(
    data: any,
    question: string
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a data analyst. Analyze the provided data and answer questions with clear insights and recommendations.',
      },
      {
        role: 'user',
        content: `Data: ${JSON.stringify(data, null, 2)}\n\nQuestion: ${question}`,
      },
    ];

    const response = await this.chat(messages);
    return response.content;
  }

  /**
   * Generate smart recommendations
   */
  static async getRecommendations(
    context: {
      userProfile?: any;
      recentActivity?: any;
      goals?: string[];
    }
  ): Promise<string[]> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a smart recommendation engine. Provide 3-5 actionable recommendations based on user context.',
      },
      {
        role: 'user',
        content: `User Context: ${JSON.stringify(context, null, 2)}\n\nProvide specific, actionable recommendations.`,
      },
    ];

    const response = await this.chat(messages);
    
    // Parse recommendations from response
    const recommendations = response.content
      .split('\n')
      .filter(line => line.trim().match(/^[\d\-\*\•]/))
      .map(line => line.replace(/^[\d\-\*\•]\s*/, '').trim())
      .filter(Boolean);

    return recommendations;
  }

  /**
   * Natural language query to SQL (simplified)
   */
  static async naturalLanguageQuery(
    query: string,
    schema: string
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a SQL expert. Convert natural language queries to SQL based on the provided schema. Only return the SQL query, no explanations.`,
      },
      {
        role: 'user',
        content: `Schema:\n${schema}\n\nQuery: ${query}`,
      },
    ];

    const response = await this.chat(messages);
    return response.content.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();
  }

  /**
   * Summarize text
   */
  static async summarize(
    text: string,
    options?: {
      length?: 'brief' | 'detailed';
      format?: 'paragraph' | 'bullets';
    }
  ): Promise<string> {
    const lengthInstruction = options?.length === 'brief' 
      ? 'Provide a brief summary in 2-3 sentences.'
      : 'Provide a detailed summary covering all key points.';
    
    const formatInstruction = options?.format === 'bullets'
      ? 'Format as bullet points.'
      : 'Format as a paragraph.';

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a text summarizer. ${lengthInstruction} ${formatInstruction}`,
      },
      {
        role: 'user',
        content: text,
      },
    ];

    const response = await this.chat(messages);
    return response.content;
  }

  /**
   * Generate workflow automation suggestions
   */
  static async suggestWorkflow(
    task: string,
    availableTools: string[]
  ): Promise<{
    steps: string[];
    automation: string;
  }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a workflow automation expert. Suggest step-by-step workflows and automation opportunities.',
      },
      {
        role: 'user',
        content: `Task: ${task}\n\nAvailable Tools: ${availableTools.join(', ')}\n\nProvide:\n1. Step-by-step workflow\n2. Automation suggestions`,
      },
    ];

    const response = await this.chat(messages);
    const content = response.content;

    // Parse steps and automation from response
    const lines = content.split('\n').filter(Boolean);
    const steps: string[] = [];
    let automation = '';
    let inAutomation = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('automation') || line.toLowerCase().includes('automate')) {
        inAutomation = true;
      }
      
      if (inAutomation) {
        automation += line + '\n';
      } else if (line.match(/^[\d\-\*\•]/)) {
        steps.push(line.replace(/^[\d\-\*\•]\s*/, '').trim());
      }
    }

    return { steps, automation: automation.trim() };
  }

  /**
   * Check if AI is configured
   */
  static isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }
}
