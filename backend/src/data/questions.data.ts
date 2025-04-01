const QUE_COUNT = 10;

export const PROMPT = (
	city: string,
) => `Generate ${QUE_COUNT} multiple-choice questions about ${city}.  Each question should have four options (options) and one correct answer index (correctAnswerIndex).

The output MUST be a bare JSON array with NO additional text, formatting, or explanations.  It will be directly parsed by an application.

Each object in the array must have the following structure:

\`\`\`json
{
  "question": "The question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswerIndex": 0  // Index (0-3) of the correct option in the options array
}
\`\`\`

Example:

\`\`\`json
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Paris", "Berlin", "Rome"],
    "correctAnswerIndex": 1
  }
]
\`\`\`

Ensure you provide EXACTLY ${QUE_COUNT} questions. No more, no less.  The "options" array MUST always have four strings. The "correctAnswerIndex" must be an integer between 0 and 3.`;
