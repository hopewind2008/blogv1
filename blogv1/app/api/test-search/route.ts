import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 搜索Google图片
async function searchGoogleImages(query: string): Promise<any[]> {
  // 使用提供的API key
  const apiKey = "AIzaSyCyngFa-OlV1JIurZF3nyoePXPuv1vH_pM";
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  console.log('Using search engine ID:', searchEngineId);

  if (!searchEngineId) {
    console.error('Missing Google Search Engine ID');
    throw new Error('Google Search API not configured properly: Missing Search Engine ID');
  }

  // 添加优化的搜索参数
  const params = new URLSearchParams({
    key: apiKey,
    cx: searchEngineId,
    q: query,
    searchType: 'image',
    num: '10',
    safe: 'active',
    imgSize: 'large',
    imgType: 'photo',
    lr: 'lang_zh-CN',
    gl: 'cn'
  });

  const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
  console.log('\nGoogle Search URL:', url);
  console.log('Search parameters:', Object.fromEntries(params.entries()));

  try {
    console.log('\nSending request to Google Search API...');
    const response = await fetch(url);
    console.log('Google Search Response Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    
    if (!response.ok) {
      if (response.status === 403) {
        console.error('API Key authentication failed');
        throw new Error('Invalid Google Search API Key');
      }
      console.error('Google Search API error response:', responseText);
      throw new Error(`Google Search API error: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid JSON response from Google Search API');
    }
    
    // 验证响应数据
    if (!data) {
      console.error('Received empty response from Google Search API');
      throw new Error('Empty response from Google Search API');
    }

    if (data.error) {
      if (data.error.code === 403) {
        console.error('API Key authentication failed:', data.error);
        throw new Error('Invalid Google Search API Key');
      }
      console.error('Google Search API returned an error:', data.error);
      throw new Error(`Google Search API error: ${data.error.message}`);
    }

    if (!data.items || data.items.length === 0) {
      console.log('No search results found');
      return [];
    }

    // 验证每个结果项
    const validItems = data.items.filter(item => {
      if (!item.link || !item.image) {
        console.log('Filtered out result missing required fields');
        return false;
      }
      // 验证图片尺寸
      const width = item.image?.width || 0;
      const height = item.image?.height || 0;
      if (width < 400 || height < 400) {
        console.log(`Filtered out small image: ${width}x${height}`);
        return false;
      }
      return true;
    });

    console.log(`\nFound ${validItems.length} valid results out of ${data.items.length} total`);
    
    return validItems;
  } catch (error) {
    console.error('Error fetching Google images:', error);
    throw error;
  }
}

// 生成多个搜索关键词
function generateSearchQueries(baseQuery: string): string[] {
  // 关键词组合
  const keywordSets = [
    ['穿搭', '搭配'],
    ['风格', '时尚'],
    ['ootd', '每日穿搭']
  ];
  
  // 生成三个不同的查询
  return keywordSets.map(keywords => 
    `${baseQuery} ${keywords.join(' ')}`
  );
}

// 搜索并合并结果
async function searchAndMergeResults(queries: string[]): Promise<any[]> {
  // 并行执行所有搜索
  const searchPromises = queries.map(query => searchGoogleImages(query));
  const searchResults = await Promise.all(searchPromises);
  
  // 合并所有结果
  const allResults = searchResults.flat();
  
  // 去重（基于图片链接）
  const uniqueResults = Array.from(
    new Map(allResults.map(item => [item.link, item])).values()
  );
  
  console.log(`\nTotal unique results after merging: ${uniqueResults.length}`);
  return uniqueResults;
}

// 过滤搜索结果
function filterResults(results: any[]): any[] {
  console.log(`\nStarting to filter ${results.length} results`);

  // 第一步：检查图片尺寸
  const sizedResults = results.filter(item => {
    const width = item.image?.width || 0;
    const height = item.image?.height || 0;
    const minSize = 400;
    const maxSize = 4000;
    const minAspectRatio = 0.5;
    const maxAspectRatio = 2.0;
    
    if (width < minSize || height < minSize) {
      console.log(`Filtered out small image: ${width}x${height}`);
      return false;
    }
    if (width > maxSize || height > maxSize) {
      console.log(`Filtered out large image: ${width}x${height}`);
      return false;
    }
    
    const aspectRatio = width / height;
    if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
      console.log(`Filtered out bad aspect ratio: ${aspectRatio}`);
      return false;
    }
    return true;
  });
  console.log(`\nAfter size filtering: ${sizedResults.length} results`);

  // 第二步：根据关键词筛选
  const keywordResults = sizedResults.filter(item => {
    const title = item.title?.toLowerCase() || '';
    const snippet = item.snippet?.toLowerCase() || '';
    const link = item.link?.toLowerCase() || '';
    
    // 检查是否包含排除关键词
    const excludeKeywords = [
      '头条文章',
      '微头条',
      '广告',
      '推广',
      '抽奖',
      '直播',
      '福利',
      'sale',
      'discount'
    ];
    const hasExcludeKeyword = excludeKeywords.some(keyword => 
      title.includes(keyword) || 
      snippet.includes(keyword) ||
      link.includes(keyword)
    );
    if (hasExcludeKeyword) {
      console.log(`Filtered out excluded keyword in: ${title}`);
      return false;
    }
    
    // 检查是否包含相关关键词
    const includeKeywords = [
      '穿搭',
      '搭配',
      '风格',
      '时尚',
      'ootd',
      '每日穿搭'
    ];
    const hasIncludeKeyword = includeKeywords.some(keyword =>
      title.includes(keyword) ||
      snippet.includes(keyword)
    );
    if (!hasIncludeKeyword) {
      console.log(`Filtered out no include keyword in: ${title}`);
    }
    return hasIncludeKeyword;
  });
  console.log(`\nAfter keyword filtering: ${keywordResults.length} results`);

  // 第三步：根据图片质量评分
  const scoredResults = keywordResults.map(item => {
    let score = 0;
    const title = item.title?.toLowerCase() || '';
    const snippet = item.snippet?.toLowerCase() || '';
    
    // 关键词加分
    const includeKeywords = [
      '穿搭',
      '搭配',
      '风格',
      '时尚',
      'ootd',
      '每日穿搭'
    ];
    includeKeywords.forEach(keyword => {
      if (title.includes(keyword)) score += 2;
      if (snippet.includes(keyword)) score += 1;
    });
    
    // 图片尺寸加分
    const width = item.image?.width || 0;
    const height = item.image?.height || 0;
    if (width >= 1000 && height >= 1000) score += 4;
    else if (width >= 800 && height >= 800) score += 3;
    else if (width >= 600 && height >= 600) score += 2;
    else if (width >= 400 && height >= 400) score += 1;
    
    // 来源加分
    const domain = item.displayLink?.toLowerCase() || '';
    const qualityDomains = [
      'pinterest',
      'instagram',
      'vogue',
      'elle',
      'bazaar',
      'cosmopolitan'
    ];
    if (qualityDomains.some(d => domain.includes(d))) {
      score += 3;
    }
    
    console.log(`Scored ${score} points for: ${title}`);
    return { ...item, score };
  });

  // 按分数排序并返回前10个结果
  const finalResults = scoredResults
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  console.log(`\nFinal results count: ${finalResults.length}`);
  return finalResults;
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query = '时尚穿搭' } = body

    // 生成多个搜索查询
    console.log('\n=== Starting Multiple Searches ===')
    const searchQueries = generateSearchQueries(query)
    console.log('Search queries:', searchQueries)
    
    try {
      // 执行多次搜索并合并结果
      const mergedResults = await searchAndMergeResults(searchQueries)
      console.log(`\nReceived ${mergedResults.length} total results after merging`)
      
      // 过滤和评分
      const filteredResults = filterResults(mergedResults)
      console.log('\nFiltered results:', filteredResults.map(item => ({
        title: item.title,
        link: item.link,
        displayLink: item.displayLink,
        score: item.score,
        image: {
          width: item.image?.width,
          height: item.image?.height,
          thumbnailLink: item.image?.thumbnailLink
        }
      })))

      return NextResponse.json({
        queries: searchQueries,
        results: filteredResults
      })
    } catch (error) {
      console.error('Search failed:', error);
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Search failed',
        queries: searchQueries
      }, { 
        status: 500 
      });
    }
  } catch (error) {
    console.error('Error parsing request:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
} 