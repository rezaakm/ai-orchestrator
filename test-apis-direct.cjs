// Quick test of Perplexity and Anthropic APIs
require('dotenv').config({ path: '.env.local' });

async function testPerplexity() {
  console.log('\n🔍 Testing Perplexity...');
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: 'Hello, test' }],
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Perplexity failed:', response.status, error);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Perplexity works!', data.choices?.[0]?.message?.content?.substring(0, 50));
    return true;
  } catch (error) {
    console.log('❌ Perplexity error:', error.message);
    return false;
  }
}

async function testAnthropic() {
  console.log('\n🤖 Testing Anthropic...');
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Hello, test' }],
    });
    
    console.log('✅ Anthropic works!', message.content[0]?.text?.substring(0, 50));
    return true;
  } catch (error) {
    console.log('❌ Anthropic error:', error.message);
    return false;
  }
}

async function main() {
  console.log('Testing API connections...');
  const pplx = await testPerplexity();
  const claude = await testAnthropic();
  
  console.log('\n📊 Results:');
  console.log('Perplexity:', pplx ? '✅' : '❌');
  console.log('Anthropic:', claude ? '✅' : '❌');
  
  if (!pplx || !claude) {
    console.log('\n⚠️  Fix the failing API(s) before using /research');
  }
}

main();
