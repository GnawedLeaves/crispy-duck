'use server'

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export interface GenerateAiOptions {
  /** The core user query or prompt */
  prompt: string
  /** Optional system instruction to guide the AI role */
  systemInstruction?: string
  /** Tone customization (e.g. "witty", "supportive", "formal", "playful") */
  tone?: string
  /** Optional arbitrary context data (objects, arrays, logs, strings) */
  context?: Record<string, unknown> | unknown[] | string
}

/**
 * Reusable, generalized Server Action powered by Gemini 1.5 Flash.
 */
export async function generateGenericAiAction(options: GenerateAiOptions) {
  const { prompt, systemInstruction, tone = 'friendly and concise', context } = options

  // Assemble system instructions including tone rules
  const baseSystem = systemInstruction
    ? `${systemInstruction}\nMaintain a ${tone} tone.`
    : `You are a helpful AI assistant. Maintain a ${tone} tone.`

  // Format context cleanly if provided
  let formattedContext = ''
  if (context) {
    formattedContext = typeof context === 'string'
      ? `\n\nContext Data:\n${context}`
      : `\n\nContext Data:\n${JSON.stringify(context, null, 2)}`
  }

  try {
    const { text } = await generateText({
      model: google('gemini-3.6-flash'),
      system: baseSystem,
      prompt: `${prompt}${formattedContext}`,
    })

    return { success: true, text, error: null }
  } catch (error) {
    console.error('Gemini AI Execution Error:', error)
    return {
      success: false,
      text: null,
      error: error instanceof Error ? error.message : 'Failed to generate AI response.'
    }
  }
}