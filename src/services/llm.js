import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateCodeFromLLM = async (brief, existingCode = '', attachmentContent = '') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro'});

  let prompt = '';

  if (existingCode) {
    prompt = `The user wants to update their webpage.
    Brief for the new changes: "${brief}"
    
    Here is the existing HTML code of the page:
    \`\`\`html
    ${existingCode}
    \`\`\`
    
    ${attachmentContent ? `Additionally, here is the content of a file they provided for this update:\n${attachmentContent}` : ''}
    
    Please provide the complete and updated HTML code in a single raw markdown block. Do not add any explanations.`;
  } else {
    prompt = `A user wants to create a new webpage.
    Brief: "${brief}"
    
    ${attachmentContent ? `Here is the content of a file they provided:\n${attachmentContent}` : ''}
    
    Please create a single, complete HTML file based on the brief. Provide only the raw HTML code in a single markdown block without any explanations.`;
  }
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  let code = response.text();
  
  code = code.replace(/```html|```/g, '').trim();
  return code;
};