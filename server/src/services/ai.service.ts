import OpenAI from 'openai';
import { env } from '../config/env.config';
import { BadRequestError } from '../utils/errors';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    if (!env.OPENAI_API_KEY) {
      throw new BadRequestError('OPENAI_API_KEY is not configured');
    }
    _client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return _client;
}

export async function transcribeAudio(buffer: Buffer, mimeType: string): Promise<string> {
  const client = getClient();

  const ext = mimeType.split('/')[1]?.split(';')[0] ?? 'webm';
  const file = new File([buffer], `audio.${ext}`, { type: mimeType });

  const result = await client.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: 'en',
  });

  return result.text.trim();
}

export interface ParsedTaskFields {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'testing' | 'done';
  dueDate: string | null;
}

const PARSE_SYSTEM_PROMPT = `You are a task extraction assistant. Given a natural language description of a task, extract structured task fields and return ONLY valid JSON matching this schema:

{
  "title": "<concise task title, max 80 chars>",
  "description": "<detailed task description>",
  "priority": "low" | "medium" | "high",
  "status": "open" | "in-progress" | "testing" | "done",
  "dueDate": "<ISO 8601 date string e.g. 2025-07-04> or null if not mentioned"
}

Rules:
- title must be a short, actionable summary
- description should expand on the details
- priority defaults to "medium" if not specified
- status defaults to "open" if not specified
- dueDate is null if no date is mentioned
- Return ONLY the JSON object, no markdown, no explanation`;

export async function parseTaskFromText(text: string): Promise<ParsedTaskFields> {
  const client = getClient();

  const today = new Date().toISOString().split('T')[0];

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: PARSE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Today's date is ${today}. Extract task fields from:\n\n"${text}"`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';

  let parsed: Partial<ParsedTaskFields>;
  try {
    parsed = JSON.parse(raw) as Partial<ParsedTaskFields>;
  } catch {
    throw new BadRequestError('AI returned invalid JSON');
  }

  return {
    title: typeof parsed.title === 'string' ? parsed.title : text.slice(0, 80),
    description: typeof parsed.description === 'string' ? parsed.description : '',
    priority: (['low', 'medium', 'high'] as const).includes(parsed.priority as never)
      ? (parsed.priority as ParsedTaskFields['priority'])
      : 'medium',
    status: (['open', 'in-progress', 'testing', 'done'] as const).includes(parsed.status as never)
      ? (parsed.status as ParsedTaskFields['status'])
      : 'open',
    dueDate: typeof parsed.dueDate === 'string' ? parsed.dueDate : null,
  };
}
