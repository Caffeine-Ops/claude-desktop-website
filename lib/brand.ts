/*
  品牌资产的「单一出处」（single source of truth）。

  全站的产品图标只有这一个文件：public/app-icon.png（透明边缘的 C+文档发光图标）。
  它同时充当：导航栏 logo、浏览器标签页 favicon、苹果书签图标、开场动画、社交分享预览图。

  想换图标 —— 直接用新图覆盖 public/app-icon.png 即可，全站一起换掉，不用动任何代码。
  路径也收在这一处：哪天要改文件名，只改下面这一行，三处引用自动跟着变。
*/
export const APP_ICON = '/app-icon.png'
