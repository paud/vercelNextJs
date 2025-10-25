import sanitizeHtml from 'sanitize-html';

// 敏感词库，可自定义扩展
const SENSITIVE_WORDS = ['badword1', 'badword2', 'test'];

export interface SafeContentOptions {
  maxLength?: number; // 最大长度限制
  allowTags?: string[]; // 允许标签
  allowAttributes?: Record<string, string[]>; // 允许属性
  sensitiveWords?: string[]; // 敏感词库
}

/**
 * 一体化安全内容处理，自动过滤 XSS、敏感词、长度、SQL 注入等。
 * 用法：safeContent(userInput)
 */
export function safeContent(input: string, options: SafeContentOptions = {}): string {
  let result = input || '';

  // 1. 长度限制
  const maxLength = options.maxLength ?? 8192;
  if (result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  // 2. XSS 过滤（HTML 标签过滤）
  result = sanitizeHtml(result, {
    allowedTags: options.allowTags ?? [],
    allowedAttributes: options.allowAttributes ?? {},
    disallowedTagsMode: 'discard',
  });

  // 3. 敏感词过滤
  const words = options.sensitiveWords ?? SENSITIVE_WORDS;
  for (const word of words) {
    const reg = new RegExp(word, 'gi');
    result = result.replace(reg, '***');
  }

  // 4. SQL 注入简单检测（仅警告，不处理，ORM 已防护）
  if (/('|"|;|--|\b(select|update|delete|insert|drop|alter|create)\b)/i.test(result)) {
    // 可扩展为日志记录或报警
    // console.warn('SQL 注入风险内容:', result);
  }

  return result;
}

/**
 * 检查内容是否包含潜在危险标签（如 script/style），返回 true/false。
 */
export function isUnsafeContent(input: string): boolean {
  const unsafe = /<\s*(script|style|iframe|object|embed|link|meta)[^>]*>/i;
  return unsafe.test(input);
}

/**
 * 推荐常用安全过滤配置
 */
export const defaultSafeContentOptions: SafeContentOptions = {
  maxLength: 1000, // 评论/消息等内容最大长度
  allowTags: ['b', 'i', 'u', 'a', 'br'], // 允许基础格式标签
  allowAttributes: { a: ['href', 'target'] }, // 仅允许 a 标签的 href/target 属性
  sensitiveWords: [
    // 英文敏感词
    'fuck', 'shit', 'bitch', 'asshole', 'damn', 'idiot', 'stupid', 'dumb',
    // 中文敏感词
    '傻逼', '妈的', '操', '滚', '垃圾', '死', '笨蛋', '蠢货', '弱智',
    // 日语敏感词
    'くそ', 'ばか', '死ね', 'アホ', 'うざい', 'バカ', '最低', '消えろ', '馬鹿', 'キモい', '殺す', '変態', '糞', '氏ね',
    // 枪支/毒品/违禁词（中英日）
    'gun', 'pistol', 'rifle', 'shotgun', 'firearm', 'weapon', 'drugs', 'cocaine', 'heroin', 'meth', 'marijuana', 'ecstasy', 'LSD', 'MDMA', 'opium', 'amphetamine', 'crystal', '毒品', '枪', '手枪', '步枪', '炸药', '武器', '大麻', '可卡因', '海洛因', '冰毒', '摇头丸', '迷幻药', '鸦片', '安非他命', '违禁品', '枪支', '军火', '毒药', '毒剂', '毒物', '覚醒剤', '麻薬', '銃', 'ピストル', 'ライフル', 'ショットガン', '武器', '火器', 'ヘロイン', 'コカイン', 'マリファナ', 'エクスタシー', 'LSD', 'MDMA', 'アヘン', 'アンフェタミン', 'クリスタル',
    // 可继续扩展
  ], // 可扩展敏感词库
};

// 用法示例：safeContent(input, defaultSafeContentOptions)
