import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { PanelProperty } from './panel.types';
import { PanelStoreService } from './panel-store.service';

@Injectable({ providedIn: 'root' })
export class AiCopyService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(PanelStoreService);

  async generate(p: Pick<
    PanelProperty,
    | 'title'
    | 'type'
    | 'status'
    | 'location'
    | 'price'
    | 'bedrooms'
    | 'bathrooms'
    | 'surface'
    | 'description'
  >): Promise<{ title: string; description: string; source: string }> {
    const settings = this.store.settings();
    if (settings.aiProvider === 'gemini' && settings.geminiApiKey.trim()) {
      try {
        return await this.viaGemini(p, settings.geminiApiKey.trim());
      } catch {
        const local = this.local(p);
        return { ...local, source: 'local (fallback Gemini)' };
      }
    }
    if (settings.aiProvider === 'openai' && settings.openaiApiKey.trim()) {
      try {
        return await this.viaOpenAI(p, settings.openaiApiKey.trim());
      } catch {
        const local = this.local(p);
        return { ...local, source: 'local (fallback OpenAI)' };
      }
    }
    return this.local(p);
  }

  local(p: {
    title: string;
    type: string;
    status: string;
    location: string;
    price: string;
    bedrooms: number | null;
    bathrooms: number | null;
    surface: string | null;
  }) {
    const op = p.status === 'alquiler' ? 'en alquiler' : 'en venta';
    const facts = [
      p.bedrooms != null ? `${p.bedrooms} dormitorios` : null,
      p.bathrooms != null ? `${p.bathrooms} baños` : null,
      p.surface ? `${p.surface} m²` : null,
    ]
      .filter(Boolean)
      .join(', ');

    const title =
      p.title?.trim() ||
      `${p.type} ${op} en ${p.location.split(',')[0].trim()}`;

    const description = [
      `${p.type} ${op} en ${p.location}.`,
      facts ? `Cuenta con ${facts}.` : null,
      `Precio: ${p.price}.`,
      'Ubicada en la comarca de Sierra de la Ventana, ideal para quienes buscan naturaleza, tranquilidad y buena conectividad con el pueblo.',
      'Consultanos por WhatsApp para coordinar una visita y recibir asesoramiento local sin compromiso.',
    ]
      .filter(Boolean)
      .join(' ');

    return { title, description, source: 'local' };
  }

  private async viaGemini(
    p: {
      title: string;
      type: string;
      status: string;
      location: string;
      price: string;
      bedrooms: number | null;
      bathrooms: number | null;
      surface: string | null;
      description: string;
    },
    apiKey: string,
  ) {
    const prompt = this.prompt(p);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await firstValueFrom(
      this.http.post<{
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      }>(url, {
        contents: [{ parts: [{ text: prompt }] }],
      }),
    );
    const text =
      res.candidates?.[0]?.content?.parts?.map((x) => x.text || '').join('') ||
      '';
    return { ...this.parseAi(text, p), source: 'gemini' };
  }

  private async viaOpenAI(
    p: {
      title: string;
      type: string;
      status: string;
      location: string;
      price: string;
      bedrooms: number | null;
      bathrooms: number | null;
      surface: string | null;
      description: string;
    },
    apiKey: string,
  ) {
    const prompt = this.prompt(p);
    const res = await firstValueFrom(
      this.http.post<{
        choices?: { message?: { content?: string } }[];
      }>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Sos copywriter inmobiliario en Sierra de la Ventana, Argentina. Respondé solo JSON.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    const text = res.choices?.[0]?.message?.content || '';
    return { ...this.parseAi(text, p), source: 'openai' };
  }

  private prompt(p: {
    title: string;
    type: string;
    status: string;
    location: string;
    price: string;
    bedrooms: number | null;
    bathrooms: number | null;
    surface: string | null;
    description: string;
  }) {
    return `Redactá un aviso inmobiliario. No inventes amenities.
Datos:
- título actual: ${p.title}
- tipo: ${p.type}
- operación: ${p.status}
- ubicación: ${p.location}
- precio: ${p.price}
- dormitorios: ${p.bedrooms ?? 'n/d'}
- baños: ${p.bathrooms ?? 'n/d'}
- superficie: ${p.surface ?? 'n/d'}
- notas: ${p.description || 'ninguna'}

Respondé SOLO JSON: {"title":"...","description":"..."}`;
  }

  private parseAi(
    text: string,
    fallback: { title: string; type: string; status: string; location: string; price: string; bedrooms: number | null; bathrooms: number | null; surface: string | null },
  ) {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return this.local(fallback);
      const json = JSON.parse(match[0]) as {
        title?: string;
        description?: string;
      };
      return {
        title: json.title?.trim() || fallback.title,
        description: json.description?.trim() || this.local(fallback).description,
      };
    } catch {
      return this.local(fallback);
    }
  }
}
