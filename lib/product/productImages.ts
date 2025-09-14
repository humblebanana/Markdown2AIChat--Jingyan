/**
 * 商品图片URL数据池 - 按类型分类
 * 用于智能匹配商品类型，提供更真实的商品展示效果
 */

// 电子产品类图片（iPad、平板、电子设备）
export const ELECTRONICS_IMAGES = [
  'https://img14.360buyimg.com/n1/s720x720_jfs/t1/286218/12/13489/38063/689db708F4d5e3a21/5d9724f97ddeee5a.png', // iPad类产品
  'https://img13.360buyimg.com/n1/jfs/t1/317792/26/22946/427772/68942d1eF8f1d2950/684bf2cc9e1f8d78.jpg',
  'https://img13.360buyimg.com/n1/jfs/t1/343073/7/1326/29999/68bfa85aFb45a9db2/103cf8b6ef03e886.png',
  'https://img13.360buyimg.com/n1/jfs/t1/348066/20/1028/47196/68c01bb9F44a1c070/5935c52477d77ba6.png',
  'https://img13.360buyimg.com/n1/jfs/t1/346757/39/2501/194445/68c3ea15Ffb2c113f/ac710d1d6e576cfe.png'
];

// 服装鞋帽类图片（冲锋裤、户外服装）
export const CLOTHING_IMAGES = [
  'https://img13.360buyimg.com/n1/jfs/t1/325092/2/11593/54140/68ae6c43F3e488d16/33e2298eb3526722.jpg',
  'https://img13.360buyimg.com/n1/jfs/t1/324631/5/17940/29873/68bfa85eFfe188e05/719c94cdfe07f5bc.png',
  'https://img13.360buyimg.com/n1/jfs/t1/328837/27/7166/39874/68a43d8aFc3a91509/81cf09851236053b.png',
  'https://img13.360buyimg.com/n1/jfs/t1/322993/34/12925/34700/68b569dcF22b8601e/7b06af4e543d06e6.jpg'
];

// 母婴用品类图片（婴儿食品、维生素）
export const BABY_HEALTH_IMAGES = [
  'https://img13.360buyimg.com/n1/jfs/t1/185623/27/16482/156388/61025e44E8de22533/4fda75b530a78949.jpg',
  'https://img13.360buyimg.com/n1/jfs/t1/278398/24/29541/51167/6816e104Fcf5f879e/8c883836f66b46eb.jpg',
  'https://img13.360buyimg.com/n1/jfs/t1/265124/24/23270/71686/67b99728F2f95bbf5/9aaa2648fcec0ac1.jpg'
];

// 户外运动类图片（睡袋、户外装备）
export const OUTDOOR_IMAGES = [
  'https://img13.360buyimg.com/n1/jfs/t1/338672/23/9716/84195/68c41024Fb0ba14e4/71f3b0370d5dadc2.jpg',
  'https://img13.360buyimg.com/n1/jfs/t1/104859/21/53784/98836/67121049Ffc1c6fa3/ba03ab3ad19c3616.jpg',
  'https://img13.360buyimg.com/n1/jfs/t1/331339/22/11327/97498/68bffb73F2bcd18e1/4cb9ccd21ae91ba4.jpg'
];

// 通用商品类图片（其他类型商品）
export const GENERAL_IMAGES = [
  'https://img13.360buyimg.com/n1/jfs/t1/253848/28/9945/177404/677ccb18F477dcd08/1678ad27b974febb.jpg',
  'https://img13.360buyimg.com/n1/jfs/t1/203303/27/11711/120648/616c925cE5df467be/64d382523378cb89.jpg',
  'https://img13.360buyimg.com/n1/jfs/t1/280150/16/27262/88329/680f37afFc04d44ac/c170ad7f7999f5a5.jpg'
];

// 所有图片的合集（向后兼容）
export const PRODUCT_IMAGE_URLS = [
  ...ELECTRONICS_IMAGES,
  ...CLOTHING_IMAGES,
  ...BABY_HEALTH_IMAGES,
  ...OUTDOOR_IMAGES,
  ...GENERAL_IMAGES
];

/**
 * 根据SKU ID或商品标题获取一个稳定的随机图片URL
 * 使用简单的哈希算法确保相同的输入总是得到相同的图片
 *
 * @param identifier - SKU ID 或商品标题，用作随机种子
 * @returns 对应的商品图片URL
 */
export function getRandomProductImage(identifier: string): string {
  // 简单的字符串哈希函数
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }

  // 确保哈希值为正数，然后映射到图片数组范围内
  const index = Math.abs(hash) % PRODUCT_IMAGE_URLS.length;
  return PRODUCT_IMAGE_URLS[index];
}

/**
 * 获取完全随机的商品图片URL（每次调用都不同）
 * 用于需要真正随机效果的场景
 *
 * @returns 随机的商品图片URL
 */
export function getTrueRandomProductImage(): string {
  const randomIndex = Math.floor(Math.random() * PRODUCT_IMAGE_URLS.length);
  return PRODUCT_IMAGE_URLS[randomIndex];
}