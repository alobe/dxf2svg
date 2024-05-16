export function percentile(data: number[], percent = 0.95, desc = false): number {
  if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
  }

  // 对数据集进行排序
  data.sort((a, b) => a - b);
if (desc) {
  data.reverse();
}

  // 计算95分位值对应的索引
  const index = Math.ceil(percent * data.length) - 1;

  // 获取并返回95分位值
  return data[index];
}
