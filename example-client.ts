/**
 * Example client demonstrating how to use the AI Orchestrator API
 * Run with: npx tsx example-client.ts
 */

const API_BASE_URL = 'http://localhost:4000';

interface ResearchRequest {
  topic: string;
  depth?: 'basic' | 'detailed' | 'comprehensive';
}

interface ResearchResponse {
  success: boolean;
  data: {
    topic: string;
    combinedInsights: string;
    sources?: string[];
    timestamp: string;
    cached: boolean;
  };
}

async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  const response = await fetch(`${API_BASE_URL}/health`);
  const data = await response.json();
  console.log('✓ Health:', data);
  console.log('');
}

async function conductResearch(topic: string, depth: 'basic' | 'detailed' | 'comprehensive' = 'detailed') {
  console.log(`🔬 Conducting research on: "${topic}" (${depth})`);
  console.log('⏳ This may take 10-20 seconds...');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE_URL}/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, depth } as ResearchRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.message}`);
    }

    const data: ResearchResponse = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✓ Research completed in ${duration}s`);
    console.log(`📊 Cached: ${data.data.cached}`);
    console.log(`📅 Timestamp: ${data.data.timestamp}`);
    
    if (data.data.sources && data.data.sources.length > 0) {
      console.log(`📚 Sources: ${data.data.sources.length} found`);
    }

    console.log('\n📝 Combined Insights:');
    console.log('─'.repeat(80));
    console.log(data.data.combinedInsights);
    console.log('─'.repeat(80));
    console.log('');

    return data;
  } catch (error) {
    console.error('❌ Research failed:', error);
    throw error;
  }
}

async function getCacheStats() {
  console.log('💾 Getting cache statistics...');
  const response = await fetch(`${API_BASE_URL}/cache/stats`);
  const data = await response.json();
  console.log('✓ Cache Stats:', data.data);
  console.log('');
}

// Main execution
async function main() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   AI Orchestrator - Example Client       ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');

  try {
    // Test health
    await testHealthCheck();

    // Get initial cache stats
    await getCacheStats();

    // Conduct research
    await conductResearch('quantum computing', 'basic');

    // Check cache stats again (should show cached entry)
    await getCacheStats();

    // Try the same query again (should be cached)
    console.log('🔄 Making the same request again (should be cached)...');
    await conductResearch('quantum computing', 'basic');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}
