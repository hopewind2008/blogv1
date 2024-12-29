import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const MAX_RESULTS = 4;

// 处理图片URL
function processImageUrl(url: string): string {
  // 确保使用HTTPS
  let processedUrl = url.replace(/^http:/, 'https:');
  
  // 处理特殊字符
  try {
    // 解码URL，然后重新编码
    processedUrl = encodeURI(decodeURI(processedUrl));
    
    // 移除可能导致问题的查询参数
    const urlObj = new URL(processedUrl);
    if (urlObj.hostname === 'assets.vogue.com') {
      // 保留 Vogue 图片必要的路径参数
      const pathParts = urlObj.pathname.split('/');
      return `https://assets.vogue.com/photos/${pathParts[2]}/master/pass/${pathParts[pathParts.length - 1]}`;
    }
    if (urlObj.hostname === 'hips.hearstapps.com') {
      // 保留 Hearst 图片必要的参数
      const essentialParams = ['crop', 'resize'];
      const params = new URLSearchParams();
      essentialParams.forEach(param => {
        const value = urlObj.searchParams.get(param);
        if (value) params.append(param, value);
      });
      return `${urlObj.origin}${urlObj.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    }
    
    // 对于其他域名，移除所有查询参数
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return processedUrl;
  }
}

// 验证图片URL
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    // 添加特定来源的请求头
    const urlObj = new URL(url);
    switch (urlObj.hostname) {
      case 'assets.vogue.com':
        headers['Referer'] = 'https://www.vogue.com/';
        break;
      case 'hips.hearstapps.com':
        headers['Referer'] = 'https://www.elle.com/';
        break;
      case 'i.pinimg.com':
        headers['Referer'] = 'https://www.pinterest.com/';
        break;
      // ... 其他域名的处理 ...
    }

    // 首先尝试 HEAD 请求
    try {
      const headResponse = await fetch(url, {
        method: 'HEAD',
        headers,
        redirect: 'follow'
      });
      
      if (headResponse.ok) {
        const contentType = headResponse.headers.get('content-type');
        if (contentType?.startsWith('image/')) {
          return true;
        }
      }
    } catch (headError) {
      console.log('HEAD request failed:', headError);
    }

    // 如果 HEAD 请求失败，使用 GET 请求但限制响应大小
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...headers,
        'Range': 'bytes=0-1024' // 只获取前1KB
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get('content-type');
    return Boolean(contentType?.startsWith('image/'));
  } catch (error) {
    console.error('Error validating image URL:', error);
    return false;
  }
}

// 检查图片尺寸是否合适
function isValidImageSize(width?: number, height?: number): boolean {
  if (!width || !height) return false
  const minSize = 300
  const maxSize = 4000
  const minAspectRatio = 0.4
  const maxAspectRatio = 2.5
  
  // 检查尺寸范围
  if (width < minSize || height < minSize) return false
  if (width > maxSize || height > maxSize) return false
  
  // 检查宽高
  const aspectRatio = width / height
  return aspectRatio >= minAspectRatio && aspectRatio <= maxAspectRatio
}

async function generateSearchQuery(currentOutfit: string, styleAnalysis: any): Promise<string[]> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `作为一位专业的时尚搭配师，请根据以下服装分析生成3个精确的搭配搜索关键词组合。
每个关键词组合应该包含以下要素，并按重要性排序：

1. 性别和年龄段（如：女生、男士、少女、青年等）
2. 主要风格定位（如：简约、优雅、休闲、街头等）
3. 关键单品名称（最多2个）
4. 主要颜色
5. 季节特征（如果明显）
6. 场合定位

当前穿搭描述：${currentOutfit}

风格分析：
- 主风格：${styleAnalysis.styleAnalysis.mainStyle}
- 配色：${styleAnalysis.styleAnalysis.colorScheme}
- 季节：${styleAnalysis.styleAnalysis.seasonality}
- 关键单品：${styleAnalysis.styleAnalysis.keyElements.join(', ')}
- 场合：${styleAnalysis.occasions.join(', ')}

请生成3个不同的搜索关键词组合，每个组合应该突出不同的搭配角度，但都要与原始风格保持一致。
关键词之间用空格分隔，每个组合都要以"outfit"结尾。
确保每个组合都包含性别和年龄段信息。
只返回3行关键词组合，每行一个组合，不要包含序号或其他文字。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const searchQueries = response.text().trim().split('\n');
    
    // 确保每个查询都以outfit结尾，并移除多余的空格
    return searchQueries
      .map(query => query.trim())
      .map(query => query.toLowerCase().endsWith('outfit') ? query : `${query} outfit`)
      .filter(query => query.length > 0)
      .slice(0, 3); // 确保只返回3个查询

  } catch (error) {
    console.error('Error generating search queries:', error);
    // 使用风格分析中的标签作为后备方案
    const fallbackQueries = styleAnalysis.matchingTags
      .slice(0, 3)
      .map(tag => `${tag} outfit`);
    return fallbackQueries.length > 0 ? fallbackQueries : ['casual outfit'];
  }
}

async function searchOutfitImages(searchQuery: string, isKids: boolean = false): Promise<ImageSearchResult[]> {
  try {
    // 将网站分组，每组选择最好的结果
    const siteGroups = [
      { name: 'weibo', sites: 'site:weibo.com' },
      { name: 'xiaohongshu', sites: 'site:xiaohongshu.com' },
      { name: 'pinterest', sites: 'site:pinterest.com' },
      { name: 'fashion', sites: '(site:vogue.com OR site:elle.com OR site:bazaar.com OR site:cosmopolitan.com)' },
      { name: 'shopping', sites: '(site:zara.com OR site:hm.com OR site:gap.com)' }
    ];

    // 并行搜索所有组
    const searchPromises = siteGroups.map(async ({ name, sites }) => {
      const query = `${searchQuery}${isKids ? ' kids fashion' : ''} ${sites}`;
      console.log(`\n[${name}] Searching with query:`, query);
      const results = await searchGoogleImages(query);
      console.log(`[${name}] Found ${results.length} results`);
      
      // 打印每个结果的详细信息
      results.forEach((result, index) => {
        console.log(`[${name}] Result ${index + 1}:`, {
          title: result.title,
          link: result.link,
          displayLink: result.displayLink,
          score: result.score
        });
      });
      
      return { name, results };
    });

    const groupResults = await Promise.all(searchPromises);
    
    // 每个组选择最好的结果
    let allResults: ImageSearchResult[] = [];
    const resultsPerGroup = Math.ceil(MAX_RESULTS / siteGroups.length);
    
    for (const { name, results } of groupResults) {
      if (results.length > 0) {
        const topResults = results
          .sort((a, b) => b.score - a.score)
          .slice(0, resultsPerGroup);
        console.log(`\n[${name}] Selected top ${topResults.length} results:`, 
          topResults.map(r => ({ 
            title: r.title, 
            link: r.link, 
            score: r.score 
          }))
        );
        allResults = allResults.concat(topResults);
      } else {
        console.log(`\n[${name}] No results found`);
      }
    }

    // 如果某些组没有结果，从其他组补充
    if (allResults.length < MAX_RESULTS) {
      const remainingSlots = MAX_RESULTS - allResults.length;
      console.log(`\nNeed ${remainingSlots} more results to reach target of ${MAX_RESULTS}`);
      
      const extraResults = groupResults
        .flatMap(({ results }) => results)
        .filter(result => !allResults.includes(result))
        .sort((a, b) => b.score - a.score)
        .slice(0, remainingSlots);
      
      console.log('Adding extra results:', 
        extraResults.map(r => ({ 
          title: r.title, 
          link: r.link, 
          score: r.score 
        }))
      );
      
      allResults = allResults.concat(extraResults);
    }

    // 最终排序
    const finalResults = allResults
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);

    console.log('\nFinal results by source:', finalResults.reduce((acc, curr) => {
      const source = curr.displayLink;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));

    return finalResults;
  } catch (error) {
    console.error('Error searching outfit images:', error);
    return [];
  }
}

// 搜索Google图片
async function searchGoogleImages(query: string): Promise<ImageSearchResult[]> {
  if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
    throw new Error('Google Search API not configured');
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=10&imgSize=xlarge&imgType=photo&safe=active`;
  
  console.log('Google Search URL:', url);

  try {
    const response = await fetch(url);
    console.log('Google Search Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Search API error response:', errorText);
      throw new Error(`Google Search API error: ${response.statusText}`);
    }

    const data = await response.json();
    const items = data.items || [];
    console.log(`Found ${items.length} items for query containing ${query.includes('pinterest') ? 'Pinterest' : query.includes('weibo') ? 'Weibo' : 'other'}`);

    return items.map((item: any) => ({
      title: item.title || '',
      link: item.link,
      displayLink: item.displayLink,
      snippet: item.snippet || '',
      image: {
        contextLink: item.image.contextLink,
        thumbnailLink: item.image.thumbnailLink,
        originalLink: item.link,
        thumbnailHeight: item.image.thumbnailHeight,
        thumbnailWidth: item.image.thumbnailWidth
      },
      source: 'google',
      score: calculateImageScore({
        title: item.title || '',
        link: item.link,
        displayLink: item.displayLink,
        source: 'google'
      })
    }));
  } catch (error) {
    console.error('Error fetching Google images:', error);
    return [];
  }
}

function calculateImageScore(result: ImageSearchResult): number {
  const { title, link, displayLink, source } = result;
  let score = 5; // 基础分数

  // 来源加分（调整权重）
  const domainScores: Record<string, number> = {
    'xiaohongshu.com': 3,
    'weibo.com': 3,
    'pinterest.com': 2.5,
    'vogue.com': 2,
    'elle.com': 2,
    'bazaar.com': 2,
    'cosmopolitan.com': 2,
    'zara.com': 1.5,
    'hm.com': 1.5,
    'gap.com': 1.5
  };

  for (const [domain, points] of Object.entries(domainScores)) {
    if (displayLink.includes(domain)) {
      score += points;
      break;
    }
  }

  // 关键词加分
  const keywords = {
    outfit: 2,
    look: 1.5,
    style: 1.5,
    fashion: 1.5,
    搭配: 2,
    穿搭: 2,
    风格: 1.5,
    时尚: 1.5
  };

  const textToCheck = (title + ' ' + link).toLowerCase();
  for (const [keyword, points] of Object.entries(keywords)) {
    if (textToCheck.includes(keyword)) {
      score += points;
    }
  }

  // 确保分数在1-10之间
  return Math.min(Math.max(score, 1), 10);
}

// 确保URL使用HTTPS
function ensureHttps(url: string): string {
  return url.replace(/^http:/, 'https:');
}

// 为每个搜索结果生成简短评语
function generateComment(result: any, styleAnalysis: any): string {
  const style = styleAnalysis.styleAnalysis.mainStyle;
  const occasion = styleAnalysis.occasions[0];
  const keyElements = styleAnalysis.styleAnalysis.keyElements.join('、');
  
  const comments = [
    `完美诠释${style}风格，搭配${keyElements}非常适合${occasion}场合`,
    `${style}风格与实用性的绝佳平衡，突出${keyElements}的精致感`,
    `富有创意的${style}搭配，${keyElements}的组合令人眼前一亮`,
    `简约大方的${style}穿搭，${keyElements}的搭配恰到好处`,
    `时尚感十足的${style}造型，${keyElements}的层次感很强`,
    `独特魅力的${style}风格，${keyElements}的配比很协调`
  ];
  
  // 随机选择一条评语
  const randomIndex = Math.floor(Math.random() * comments.length);
  return comments[randomIndex];
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { currentOutfit, analysis } = body

    console.log('\n=== Request received ===')
    console.log('Current outfit:', currentOutfit)
    console.log('Analysis:', analysis)

    if (!currentOutfit || !analysis) {
      console.error('Missing required fields:', { currentOutfit: !!currentOutfit, analysis: !!analysis })
      return NextResponse.json(
        { error: '缺少必要的搭配信息' },
        { status: 400 }
      )
    }

    // 生成多个搜索查询
    console.log('\n=== Generating search queries ===')
    const searchQueries = await generateSearchQuery(currentOutfit, analysis)
    console.log('Generated queries:', searchQueries)

    // 并行执行所有查询的搜索
    console.log('\n=== Executing searches ===')
    const searchPromises = searchQueries.map(query => {
      console.log('Searching for query:', query)
      return searchOutfitImages(query)
    })
    const allSearchResults = await Promise.all(searchPromises)
    
    console.log('\n=== Search results summary ===')
    allSearchResults.forEach((results, index) => {
      console.log(`Query ${index + 1} returned ${results.length} results`)
    })

    // 合并所有搜索结果
    let allResults = allSearchResults.flat()
    console.log('\nTotal results before processing:', allResults.length)

    // 为每个结果添加评语和分数
    console.log('\n=== Processing results ===')
    const scoredResults = allResults.map(result => {
      const score = calculateImageScore(result)
      const comment = generateComment(result, analysis)
      
      const processedResult = {
        ...result,
        score: Number(score.toFixed(1)),
        comment: comment || '优雅时尚的穿搭灵感'
      }
      
      console.log('\nProcessed result:', {
        title: processedResult.title,
        link: processedResult.link,
        score: processedResult.score,
        comment: processedResult.comment
      })
      
      return processedResult
    })

    // 按分数排序并选择最佳结果
    const finalResults = scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)

    console.log('\n=== Final results ===')
    console.log(`Selected ${finalResults.length} best matches`)
    finalResults.forEach((result, index) => {
      console.log(`\nResult ${index + 1}:`)
      console.log('Title:', result.title)
      console.log('Link:', result.link)
      console.log('Score:', result.score)
      console.log('Comment:', result.comment)
    })

    return NextResponse.json({
      queries: searchQueries,
      results: finalResults
    })
  } catch (error) {
    console.error('\n=== Error occurred ===')
    console.error('Error details:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '搜索失败，请重试' },
      { status: 500 }
    )
  }
} 