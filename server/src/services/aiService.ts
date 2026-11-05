import { prisma } from '../config/prisma.js';

export interface ExtractedProduct {
  id?: string;
  name: string;
  sku?: string;
  brand: string;
  categoryId?: string;
  categoryName?: string;
  mrp: number;
  salePrice: number;
  discount: number;
  stock: number;
  lowStockThreshold: number;
  shortDescription: string;
  description: string;
  features: string[];
  specifications: Array<{ name: string; value: string }>;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  suggestedImages?: string[];
  missingFields: string[];
}

export interface AIExtractionResult {
  bulkDetected: boolean;
  productCount: number;
  products: ExtractedProduct[];
}

export class AIService {
  static async extractProductData(rawText: string): Promise<AIExtractionResult> {
    const categories = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    // Check if multiple products exist in raw text
    const productBlocks = this.splitProductBlocks(rawText);

    if (apiKey) {
      try {
        const aiResult = await this.extractWithGeminiApi(rawText, categories, apiKey);
        if (aiResult && aiResult.products && aiResult.products.length > 0) {
          return aiResult;
        }
      } catch (err) {
        console.warn('Gemini API extraction fallback to pattern parser:', err);
      }
    }

    // Pattern-based structural parser fallback
    const extractedProducts: ExtractedProduct[] = productBlocks.map((block) =>
      this.parseBlockWithHeuristics(block, categories)
    );

    return {
      bulkDetected: extractedProducts.length > 1,
      productCount: extractedProducts.length,
      products: extractedProducts
    };
  }

  private static splitProductBlocks(rawText: string): string[] {
    // Check for explicit markers like PRODUCT 1, PRODUCT 2, Item 1, Item 2 or ---
    const explicitSplit = rawText.split(/(?:PRODUCT\s+\d+|Item\s+\d+|---)/i).map((s) => s.trim()).filter((s) => s.length > 20);
    if (explicitSplit.length > 1) {
      return explicitSplit;
    }

    // Check for double headers with Product: or Name:
    const matches = rawText.split(/(?=\b(?:Product|Name|Item)\s*:\s*)/gi).map((s) => s.trim()).filter((s) => s.length > 20);
    if (matches.length > 1) {
      return matches;
    }

    return [rawText];
  }

  private static parseBlockWithHeuristics(block: string, categories: Array<{ id: string; name: string; slug: string }>): ExtractedProduct {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const missingFields: string[] = [];

    // 1. Name
    let name = '';
    const nameMatch = block.match(/(?:Product|Name|Model|Title)\s*:\s*([^\n]+)/i);
    if (nameMatch) {
      name = nameMatch[1].trim();
    } else if (lines.length > 0) {
      name = lines[0].replace(/^(?:Product|Name|Item|\d+[\.\)])\s*/i, '').trim();
    }
    name = name.replace(/[\.\,]+$/, '').trim();
    if (!name) name = 'KING DAY Kids Product';

    // 2. SKU
    let sku = '';
    const skuMatch = block.match(/(?:SKU|Model|Code)\s*:\s*([A-Za-z0-9\-_]+)/i);
    if (skuMatch) {
      sku = skuMatch[1].trim();
    } else {
      missingFields.push('SKU');
    }

    // 3. Brand
    let brand = 'KING DAY';
    const brandMatch = block.match(/Brand\s*:\s*([^\n]+)/i);
    if (brandMatch) {
      brand = brandMatch[1].replace(/[\.\,]+$/, '').trim();
    }

    // 4. MRP & Sale Price
    let mrp = 0;
    let salePrice = 0;

    const mrpMatch = block.match(/(?:MRP|Original Price|Price)\s*[:₹\s]*([0-9,]+)/i);
    if (mrpMatch) {
      mrp = parseInt(mrpMatch[1].replace(/,/g, ''), 10);
    }

    const saleMatch = block.match(/(?:Offer|Sale|Special|Offer Price|Discounted Price)\s*(?:Price)?\s*[:₹\s]*([0-9,]+)/i);
    if (saleMatch) {
      salePrice = parseInt(saleMatch[1].replace(/,/g, ''), 10);
    } else if (mrp > 0 && !saleMatch) {
      const altPriceMatch = block.match(/₹\s*([0-9,]+)/g);
      if (altPriceMatch && altPriceMatch.length >= 2) {
        const prices = altPriceMatch.map((p) => parseInt(p.replace(/[^0-9]/g, ''), 10)).sort((a, b) => b - a);
        mrp = prices[0];
        salePrice = prices[1];
      } else {
        salePrice = mrp;
      }
    }

    if (!mrp && salePrice) mrp = Math.round(salePrice * 1.3);
    if (!mrp) { mrp = 14999; missingFields.push('MRP'); }
    if (!salePrice) { salePrice = 9999; missingFields.push('Sale Price'); }

    // Discount Calculation: Math.round(((mrp - salePrice) / mrp) * 100)
    const discount = mrp > salePrice ? Math.round(((mrp - salePrice) / mrp) * 100) : 0;

    // 5. Stock
    let stock = 10;
    const stockMatch = block.match(/(?:Stock|Qty|Quantity|Available)\s*:\s*(\d+)/i);
    if (stockMatch) {
      stock = parseInt(stockMatch[1], 10);
    } else {
      missingFields.push('Stock Quantity');
    }

    // 6. Category Matching
    let categoryId = '';
    let categoryName = '';
    const categoryMatch = categories.find((c) =>
      block.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes('ride-on') || c.name.toLowerCase().includes('jeep')
    );
    if (categoryMatch) {
      categoryId = categoryMatch.id;
      categoryName = categoryMatch.name;
    } else if (categories.length > 0) {
      categoryId = categories[0].id;
      categoryName = categories[0].name;
    }

    // 7. Features (extract clean bullet lines or comma lists)
    const featuresSet = new Set<string>();
    const featureKeywords = ['remote', 'bluetooth', 'led', 'motor', 'battery', 'tyre', 'music', 'seat', 'suspension', 'steering', 'charger', 'seatbelt'];

    lines.forEach((line) => {
      const lower = line.toLowerCase();
      if (featureKeywords.some((k) => lower.includes(k)) && !lower.startsWith('mrp') && !lower.startsWith('offer') && !lower.startsWith('brand')) {
        const clean = line.replace(/^[\-\*\•\d+\.\)]\s*/, '').replace(/[\.\,]+$/, '').trim();
        if (clean.length > 2 && clean.length < 80) {
          featuresSet.add(clean);
        }
      }
    });

    if (featuresSet.size === 0) {
      featuresSet.add('Dual 12V High Torque Motors');
      featuresSet.add('2.4G Parental Remote Control');
      featuresSet.add('Bluetooth Music & LED Working Lights');
    }

    const features = Array.from(featuresSet);

    // 8. Specifications
    const specifications: Array<{ name: string; value: string }> = [];

    const batteryMatch = block.match(/(\d+V(?:\s*\d+(?:\.\d+)?Ah)?)\s*(?:battery)?/i);
    if (batteryMatch) specifications.push({ name: 'Battery', value: batteryMatch[1] });

    const motorMatch = block.match(/(\d+\s*motors?)/i);
    if (motorMatch) specifications.push({ name: 'Motors', value: motorMatch[1] });

    const loadMatch = block.match(/(?:load|capacity|weight)\s*[:\s]*(\d+\s*kg)/i);
    if (loadMatch) specifications.push({ name: 'Maximum Load', value: loadMatch[1] });

    const ageMatch = block.match(/(?:age|years)\s*[:\s]*([\d–\-]+\s*years?)/i);
    if (ageMatch) specifications.push({ name: 'Age Group', value: ageMatch[1] });

    // 9. SEO & Slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const seoTitle = `${name} | ${brand}`;
    const seoDescription = `${name} with ${features.slice(0, 3).join(', ')}. Certified safe kids ride-on by KING DAY.`;

    // 10. Suggested Image URLs if present
    const imageMatches = block.match(/https?:\/\/[^\s]+\.(?:jpg|jpeg|png|webp)/gi);

    return {
      name,
      sku: sku || undefined,
      brand,
      categoryId,
      categoryName,
      mrp,
      salePrice,
      discount,
      stock,
      lowStockThreshold: 3,
      shortDescription: `${name} built with ${features.slice(0, 2).join(' and ')}.`,
      description: `${name} is a high-performance children's product designed for maximum safety, comfort, and entertainment.\n\nKey Highlights:\n` + features.map((f) => `• ${f}`).join('\n'),
      features,
      specifications,
      seoTitle,
      seoDescription,
      slug,
      suggestedImages: imageMatches || undefined,
      missingFields
    };
  }

  private static async extractWithGeminiApi(
    rawText: string,
    categories: Array<{ id: string; name: string; slug: string }>,
    apiKey: string
  ): Promise<AIExtractionResult | null> {
    const prompt = `You are an AI Product Data Assistant for KING DAY e-commerce store.
Extract structured product details from the raw text below.

RULES:
1. Do NOT invent or fabricate factual product specs that are not present. If battery/motor/spec is missing, leave it out of specifications or mark missing.
2. Available categories in system: ${JSON.stringify(categories)}. Select matching categoryId if text matches one of these categories.
3. Calculate discount = Math.round(((mrp - salePrice) / mrp) * 100).
4. Extract features as clean bullet points without duplicates.
5. If text contains multiple products, extract ALL of them into an array under "products".

RAW TEXT:
"""
${rawText}
"""

Return ONLY a JSON object with format:
{
  "bulkDetected": false,
  "productCount": 1,
  "products": [
    {
      "name": "string",
      "sku": "string or null",
      "brand": "string",
      "categoryId": "string or null",
      "categoryName": "string or null",
      "mrp": number,
      "salePrice": number,
      "discount": number,
      "stock": number,
      "lowStockThreshold": 3,
      "shortDescription": "string",
      "description": "string",
      "features": ["string"],
      "specifications": [{"name": "string", "value": "string"}],
      "seoTitle": "string",
      "seoDescription": "string",
      "slug": "string",
      "missingFields": ["string"]
    }
  ]
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!res.ok) return null;
    const json: any = await res.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText);
    return parsed;
  }
}
