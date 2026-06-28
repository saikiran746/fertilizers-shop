const OpenAI = require('openai');
const prisma = require('../prismaClient');
const mapMongoId = require('../utils/mongoMapper');

let openaiClient = null;

function getClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function buildSystemPrompt(knowledgeContext, customPrompt) {
  let systemPrompt = `You are AgroPlus AI, a professional agricultural assistant and helpful store representative for AgroPlus Fertilizers.

SECURITY & BOUNDARIES (STRICTLY ENFORCED):
- NEVER expose admin data, database schema, server details, source code, private records, internal IDs, or cost prices.
- ONLY show public product information provided by your tools.
- Never invent or hallucinate products. If a product isn't found, say: "I couldn't find a matching product in our inventory. Please contact our team for assistance."
- If the user asks an unrelated question (e.g., Who is the PM?, write code, tell a joke), reply exactly with: "I am AgroPlus AI and can only assist with AgroPlus products, fertilizers, crops, soil health, farming guidance, and orders."

BEHAVIORAL GUIDELINES:
- **Greeting**: If the user says "Hi", "Hello", etc., reply with: "Hello 👋 Welcome to AgroPlus Fertilizers. How can I help you today?"
- **Tone**: Friendly, professional farmer-support tone. Not robotic.
- **Conversational**: If a user says "Thanks", reply naturally e.g., "You're welcome. Let me know if you need help selecting the right fertilizer."
- **Recommendation Logic**: When asked to recommend a product, first ask follow-up questions to understand their needs (e.g., Which crop? Soil type? Growth stage?). Once you have enough context, call the \`search_products\` tool to find matching products in the database.
- **Max Products**: Recommend AT MOST 3 relevant products at a time.
- **Product Display Format**: When recommending a product returned by your tool, format it clearly and mention its Name, Description, Benefits, Price (₹), and Availability (In Stock / Out of Stock). Do NOT return hidden or internal fields like _id or timestamps.

${knowledgeContext}`;

  if (customPrompt && customPrompt.trim()) {
    systemPrompt += `\n\n=== ADDITIONAL INSTRUCTIONS FROM ADMIN ===\n${customPrompt}`;
  }

  return systemPrompt;
}

// The tool definition for OpenAI
const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search the AgroPlus product database dynamically for matching fertilizers or agricultural products based on user query, crop type, or price limit.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search keywords (e.g., 'nitrogen', 'tomato', 'organic', 'urea'). Leave empty to match all."
          },
          maxPrice: {
            type: "number",
            description: "Maximum price filter in INR (₹). For example, if user asks 'under 1000', set this to 1000."
          },
          category: {
            type: "string",
            description: "Filter by specific category if known (e.g., 'Organic Fertilizers', 'Micronutrients')."
          }
        }
      }
    }
  }
];

// Helper to actually search DB
async function executeProductSearch(args) {
  try {
    const { query, maxPrice, category } = args;
    
    let dbQuery = { visible: true };

    if (query) {
      dbQuery.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { benefits: { contains: query, mode: "insensitive" } }
      ];
    }
    
    if (maxPrice !== undefined) {
      dbQuery.price = { lte: maxPrice, gt: 0 };
    }
    
    if (category) {
      dbQuery.category = { contains: category, mode: "insensitive" };
    }

    const products = await prisma.product.findMany({
      where: dbQuery,
      take: 5,
      select: { id: true, name: true, description: true, category: true, price: true, benefits: true, inStock: true, image: true }
    });

    if (products.length === 0) {
      return { success: true, message: "No products found matching the criteria.", products: [] };
    }

    return { success: true, products: mapMongoId(products) };
  } catch (error) {
    console.error("Error executing product search:", error);
    return { success: false, message: "Database search failed due to an internal error." };
  }
}

async function generateChatResponse(messages, settings, knowledgeContext) {
  const client = getClient();

  if (!client) {
    return { reply: generateFallbackResponse(messages[messages.length - 1]?.content || '', knowledgeContext), metadata: {} };
  }

  try {
    const systemPrompt = buildSystemPrompt(knowledgeContext, settings.systemPrompt);

    // Prepare message history
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    ];

    let response = await client.chat.completions.create({
      model: settings.modelName || 'gpt-4o-mini',
      messages: formattedMessages,
      max_tokens: settings.maxTokens || 500,
      temperature: settings.temperature || 0.7,
      tools: tools,
      tool_choice: "auto",
    });

    let message = response.choices[0].message;
    let productsReferenced = [];

    // Process tool calls if any
    while (message.tool_calls && message.tool_calls.length > 0) {
      formattedMessages.push(message);

      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === 'search_products') {
          const args = JSON.parse(toolCall.function.arguments);
          const searchResult = await executeProductSearch(args);
          
          if (searchResult.success && searchResult.products.length > 0) {
             productsReferenced.push(...searchResult.products);
          }

          formattedMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(searchResult),
          });
        }
      }

      // Call API again with the tool response
      response = await client.chat.completions.create({
        model: settings.modelName || 'gpt-4o-mini',
        messages: formattedMessages,
        max_tokens: settings.maxTokens || 500,
        temperature: settings.temperature || 0.7,
        tools: tools,
        tool_choice: "auto",
      });

      message = response.choices[0].message;
    }

    // De-duplicate referenced products
    const uniqueProducts = Array.from(new Set(productsReferenced.map(p => p._id.toString())))
      .map(id => productsReferenced.find(p => p._id.toString() === id));

    // Limit to 3 visual cards in the UI as requested by user ("Show at most 3 relevant product recommendations at a time")
    const top3Products = uniqueProducts.slice(0, 3);

    return {
      reply: message.content || 'I apologize, I could not generate a response.',
      metadata: { productsReferenced: top3Products }
    };

  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    return { reply: generateFallbackResponse(messages[messages.length - 1]?.content || '', knowledgeContext), metadata: {} };
  }
}

function generateFallbackResponse(userMessage, knowledgeContext) {
  // Keeping fallback for when API key is missing
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('hi') || msg.includes('hello')) {
    return "Hello 👋 Welcome to AgroPlus Fertilizers. How can I help you today?";
  }
  
  if (msg.includes('thanks') || msg.includes('thank you')) {
    return "You're welcome. Let me know if you need help selecting the right fertilizer.";
  }

  // Very simple irrelevant check fallback
  const isAgroRelated = ['contact', 'product', 'fertilizer', 'rice', 'cotton', 'tomato', 'yield', 'soil', 'weather', 'rain', 'leaf'].some(k => msg.includes(k));
  if (!isAgroRelated && msg.length > 5) {
     return "I am AgroPlus AI and can only assist with AgroPlus products, fertilizers, crops, soil health, farming guidance, and orders.";
  }

  return \`I am AgroPlus AI. Please contact our team for assistance or ask me about our agricultural products.\`;
}

module.exports = { generateChatResponse, generateFallbackResponse };
