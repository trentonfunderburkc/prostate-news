import OpenAI from 'openai';
import { withRetry } from './lib/retry.js';
import { geminiGenerateText, isGeminiConfigured } from './gemini.js';

const API_TIMEOUT_MS = parseInt(process.env.API_TIMEOUT_MS || '60000', 10);

const SCENE_SYSTEM_PROMPT =
  'Опиши ОДНУ конкретную фотографию для иллюстрации русскоязычной медицинской статьи о мужском здоровье и урологии. Ответ на английском, 2-3 предложения. Сцена: кабинет уролога, поликлиника, врач за столом (без чёткого лица), медицинская брошюра, здоровый образ жизни мужчины средних лет. Без обнажённости, без графических медицинских процедур. Локация: обычная российская поликлиника. Стиль: нейтральное любительское фото. В кадре НЕТ текста, вывесок, надписей.';

export function extractSceneFromTitle(title) {
  const t = title.toLowerCase();
  const scenes = [
    [/простат|аденом|предстательн/i, 'urology clinic consultation room with doctor desk, medical charts, neutral lighting, no graphic content'],
    [/мочеиспуск|мочев|цистит|недержан/i, 'modern hospital corridor or urology department waiting area, clean and calm atmosphere'],
    [/эректил|потенц|тестостерон|андролог/i, 'middle-aged man walking in park, healthy lifestyle scene, morning light, no face close-up'],
    [/лечен|профилакт|терапи|препарат/i, 'pharmacy shelf with medicine boxes blurred, medical consultation setting'],
    [/диагност|обследован|анализ|пса/i, 'medical laboratory or doctor office with test results folder on desk, professional setting'],
    [/уролог|уретр|камн/i, 'urology department interior, examination room door, clinical but friendly atmosphere'],
  ];
  for (const [pattern, scene] of scenes) {
    if (pattern.test(t)) return scene;
  }
  return 'neutral urology clinic waiting room in a Russian polyclinic, calm medical atmosphere, no graphic content';
}

export function photoRealismWrapper(sceneDescription) {
  return [
    sceneDescription,
    'Must look like an unedited candid photograph, NOT illustration, NOT digital art, NOT CGI.',
    'Shot on an old smartphone: soft focus, natural indoor light, slight JPEG compression.',
    'Muted clinical tones, realistic textures, ordinary medical environment.',
    'Awkward framing, off-center composition, mundane clinic details in background.',
    'FORBIDDEN: text, letters, numbers, logos, watermarks, readable documents.',
    'FORBIDDEN: nudity, graphic medical procedures, surgery, blood, stock photo perfection.',
  ].join(' ');
}

async function openAiImageScene(apiKey, baseURL, model, provider, title, category, body) {
  const response = await withRetry(
    async () => {
      const client = new OpenAI({ apiKey, baseURL, timeout: API_TIMEOUT_MS, maxRetries: 0 });
      return client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SCENE_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Заголовок: ${title}\nКатегория: ${category}\nСодержание: ${body.slice(0, 400) || title}`,
          },
        ],
        max_tokens: 180,
      });
    },
    { attempts: 3, label: `${provider} Image Prompt` },
  );
  return response.choices[0]?.message?.content?.trim();
}

export async function aiImageScene(title, category, body) {
  const userPrompt = `Заголовок: ${title}\nКатегория: ${category}\nСодержание: ${body.slice(0, 400) || title}`;

  if (isGeminiConfigured()) {
    try {
      const scene = await geminiGenerateText({ system: SCENE_SYSTEM_PROMPT, user: userPrompt });
      if (scene && scene.length > 40) {
        console.log(`  [Gemini Image Prompt] ${scene.slice(0, 70)}…`);
        return scene;
      }
    } catch (err) {
      console.warn(`  [Gemini Image Prompt] ${err.message}`);
    }
  }

  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const textProviders = [];
  if (deepseekKey && deepseekKey !== 'sk-...') {
    textProviders.push({
      name: 'DeepSeek',
      apiKey: deepseekKey,
      baseURL: 'https://api.deepseek.com',
      model: 'deepseek-chat',
    });
  }
  if (openaiKey && openaiKey !== 'sk-...') {
    textProviders.push({ name: 'OpenAI', apiKey: openaiKey, model: 'gpt-4o-mini' });
  }

  for (const p of textProviders) {
    try {
      const scene = await openAiImageScene(p.apiKey, p.baseURL, p.model, p.name, title, category, body);
      if (scene && scene.length > 40) {
        console.log(`  [${p.name} Image Prompt] ${scene.slice(0, 70)}…`);
        return scene;
      }
    } catch (err) {
      console.warn(`  [${p.name} Image Prompt] ${err.message}`);
    }
  }

  return extractSceneFromTitle(title);
}

export async function buildImagePrompt(title, category, body) {
  const scene = await aiImageScene(title, category, body);
  return photoRealismWrapper(scene);
}
