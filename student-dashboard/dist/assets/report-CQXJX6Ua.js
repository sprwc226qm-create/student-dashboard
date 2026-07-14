import{ct as e}from"./runtime-core.esm-bundler-rATHuYmI.js";import{s as t}from"./index-CfooPg6P.js";var n=[{id:`tpl-1`,name:`学业预警报告`,description:`针对触发预警学生生成学情分析与干预建议报告`,icon:`⚠️`,sections:[{id:`s1`,title:`学生基本信息`,type:`text`,content:``,dataKey:`basicInfo`,editable:!1},{id:`s2`,title:`学业成绩分析`,type:`chart`,content:``,chartType:`line`,dataKey:`gpaTrend`,editable:!0},{id:`s3`,title:`预警原因诊断`,type:`text`,content:``,dataKey:`warningDiagnosis`,editable:!0},{id:`s4`,title:`干预建议`,type:`text`,content:``,dataKey:`intervention`,editable:!0},{id:`s5`,title:`课程掌握度`,type:`chart`,content:``,chartType:`radar`,dataKey:`courseMastery`,editable:!0}]},{id:`tpl-2`,name:`学期总结报告`,description:`全面总结学生本学期的学业、行为、消费等各方面表现`,icon:`📊`,sections:[{id:`s1`,title:`学期概况`,type:`text`,content:``,dataKey:`semesterSummary`,editable:!0},{id:`s2`,title:`学业成绩趋势`,type:`chart`,content:``,chartType:`line`,dataKey:`gpaTrend`,editable:!0},{id:`s3`,title:`行为数据分析`,type:`mixed`,content:``,dataKey:`behaviorAnalysis`,editable:!0},{id:`s4`,title:`综合素质评估`,type:`chart`,content:``,chartType:`radar`,dataKey:`qualityRadar`,editable:!0},{id:`s5`,title:`下阶段建议`,type:`text`,content:``,dataKey:`nextPlan`,editable:!0}]},{id:`tpl-3`,name:`个性化发展建议`,description:`基于学生画像提供个性化的学业和职业发展建议`,icon:`💡`,sections:[{id:`s1`,title:`学生画像概述`,type:`text`,content:``,dataKey:`portrait`,editable:!0},{id:`s2`,title:`优势与特长`,type:`text`,content:``,dataKey:`strengths`,editable:!0},{id:`s3`,title:`待提升领域`,type:`text`,content:``,dataKey:`weaknesses`,editable:!0},{id:`s4`,title:`课程推荐`,type:`table`,content:``,dataKey:`courseRecommendations`,editable:!0},{id:`s5`,title:`发展路径建议`,type:`text`,content:``,dataKey:`developmentPath`,editable:!0}]}],r=t(`report`,()=>{let t=e(n),r=e([]),i=e(null),a=e(null),o=e(null);function s(e){a.value=t.value.find(t=>t.id===e)||null}function c(e){o.value=e}function l(e,t){if(!a.value||!o.value)throw Error(`请先选择模板和学生`);let n=o.value,s=a.value,c=s.sections.map(e=>{let r=``;return t&&e.editable?r=t:e.dataKey===`basicInfo`?r=`姓名：${n.name}\n学号：${n.studentNo}\n班级：${n.class}\n专业：${n.major}\n辅导员：${n.counselor}`:e.dataKey===`warningDiagnosis`?r=`该生触发了学业预警规则，经系统分析，主要原因包括：
1. 近期学业成绩呈下降趋势
2. 部分课程掌握度低于班级平均水平
3. 学习行为投入指标有所下降

建议辅导员及时介入，与学生进行面对面沟通。`:e.dataKey===`intervention`?r=`干预建议：
1. 安排一对一学业辅导，重点关注薄弱课程
2. 建议学生每周至少去图书馆学习3次
3. 与任课教师沟通，了解课堂表现
4. 建立学习小组，互相督促
5. 定期（每2周）进行学业进展跟踪`:e.dataKey===`semesterSummary`?r=`本学期${n.name}同学整体表现尚可，综合评分${n.overallScore}分。学业方面需要加强对薄弱课程的投入，课外活动参与积极。`:e.dataKey===`portrait`?r=`${n.name}，${n.major}专业${n.class}学生。综合评分${n.overallScore}分，标签：${n.tags.map(e=>e.label).join(`、`)}`:e.dataKey===`strengths`?r=`1. 具有较强的逻辑思维能力\n2. 团队协作表现优秀\n3. ${n.tags[0]?.label||`学习态度端正`}`:e.dataKey===`weaknesses`?r=`1. 部分专业基础课程掌握不够扎实
2. 学习时间管理有待提升
3. 课外拓展阅读量不足`:e.dataKey===`courseRecommendations`?r=`| 课程名称 | 推荐理由 | 优先级 |
|---------|---------|-------|
| 数据结构进阶 | 弥补薄弱环节 | 高 |
| 项目管理实践 | 提升综合能力 | 中 |
| 人工智能导论 | 拓展专业视野 | 中 |`:e.dataKey===`developmentPath`?r=`建议发展路径：
1. 短期（本学期）：夯实专业基础，确保GPA不低于3.0
2. 中期（下一学年）：参与科研项目或实习，积累实践经验
3. 长期（毕业前）：明确职业方向，准备就业或考研`:e.dataKey===`behaviorAnalysis`?r=`学习时长：${n.overallScore>80?`高于`:`接近`}班级平均水平\n图书馆打卡：规律\n课堂出勤：良好\n建议保持当前学习习惯，适当增加课外拓展。`:e.dataKey===`nextPlan`&&(r=`下阶段建议：
1. 重点关注薄弱课程的学习
2. 积极参与学科竞赛
3. 提前规划暑期实习`),{...e,content:r}}),l={id:`rpt-${Date.now()}`,templateId:s.id,templateName:s.name,studentId:n.id,studentName:n.name,studentNo:n.studentNo,className:n.class,title:e,content:c.map(e=>`## ${e.title}\n\n${e.content}`).join(`

`),sections:c,charts:s.id===`tpl-1`||s.id===`tpl-2`?[{id:`chart-gpa`,title:`GPA趋势`,type:`line`,option:{xAxis:{type:`category`,data:[`2023秋`,`2024春`,`2024秋`,`2025春`,`2025秋`]},yAxis:{type:`value`,min:0,max:4},series:[{type:`line`,data:[3.2,3.5,3.1,3.6,3.8],smooth:!0}]}},{id:`chart-radar`,title:`课程掌握度`,type:`radar`,option:{radar:{indicator:[{name:`高等数学`,max:100},{name:`数据结构`,max:100},{name:`计算机网络`,max:100},{name:`软件工程`,max:100},{name:`数据库`,max:100}]},series:[{type:`radar`,data:[{value:[85,72,58,91,66]}]}]}}]:[],createTime:new Date().toISOString(),updateTime:new Date().toISOString(),status:`generated`};return i.value=l,r.value.unshift(l),l}function u(e,t){if(!i.value)return;let n=i.value.sections.find(t=>t.id===e);n&&(n.content=t,i.value.content=i.value.sections.map(e=>`## ${e.title}\n\n${e.content}`).join(`

`),i.value.updateTime=new Date().toISOString())}function d(e){r.value=r.value.filter(t=>t.id!==e),i.value?.id===e&&(i.value=null)}function f(e){return r.value.filter(t=>t.studentId===e)}return{templates:t,reports:r,currentReport:i,selectedTemplate:a,selectedStudent:o,selectTemplate:s,setStudent:c,generateReport:l,updateReportSection:u,deleteReport:d,getReportsByStudent:f}});export{r as t};