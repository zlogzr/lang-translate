/**
 * 读取xlsx文件,匹配对应中文的英文
 */
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const excelPath = path.join(__dirname, "../public/lang.xlsx");

// 读取Excel文件
const workbook = XLSX.readFile(excelPath);

// 获取第一个工作表
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// 将工作表转换为JSON对象
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// 将JSON对象转换成自己想要的数据
const result = jsonData
  .filter((_, index) => index > 1)
  .map((item) => ({
    zh: item[2],
    en: item[3],
  }));

// 源文件路径
const sourceFilePath = path.join(__dirname, "source/checkoutMessages.js");

// 读取源文件内容
const sourceFileContent = fs.readFileSync(sourceFilePath, "utf-8");

// 转换源文件内容
const newContent =
  "module.exports = " + sourceFileContent.replace("export default ", "");

// 临时文件路径
const tempFileFile = path.join(__dirname, "tempFileFile.js");
// 写入文件
fs.writeFileSync(tempFileFile, newContent);
// 读取转换后的文件
const newContentObj = require(tempFileFile);
// 删除文件
fs.unlinkSync(tempFileFile);

// 遍历新的数据，查找对应的中文翻译
Object.keys(newContentObj).forEach((key) => {
  const index = result.findIndex((item) => item.zh === newContentObj[key]);
  if (index !== -1) {
    newContentObj[key] = result[index].en;
  }
});

// 将修改后的数据输出文件
const outputFilePath = path.join(__dirname, "source/checkoutMessages-new.js");
const outputContent =
  "export default " + JSON.stringify(newContentObj, null, 2);

fs.writeFileSync(outputFilePath, outputContent);
