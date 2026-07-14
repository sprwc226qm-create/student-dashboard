// src/mocks/data/students.ts
export interface Student {
  name: string
  studentNo: string
  class: string
  gpa: number
}

// 随机生成 GPA（1.0 ~ 4.0，保留一位小数）
function randomGpa(): number {
  return Math.round((1.0 + Math.random() * 3.0) * 10) / 10
}

// 班级列表
const classes = ['软件工程1班', '软件工程2班', '计算机科学1班', '数据科学1班', '人工智能1班']

// 姓氏和名字
const surnames = ['张', '李', '王', '赵', '刘', '陈', '杨', '黄', '吴', '周', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗']
const givenNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋', '勇', '艳', '杰', '倩', '鹏', '宇', '阳', '超', '明', '雪']

function randomName(): string {
  return surnames[Math.floor(Math.random() * surnames.length)] +
         givenNames[Math.floor(Math.random() * givenNames.length)]
}

// 生成 50 条数据
export const mockStudents: Student[] = Array.from({ length: 50 }, (_, i) => {
  const index = i + 1
  return {
    name: randomName(),
    studentNo: `2023${String(10000 + index).padStart(5, '0')}`,
    class: classes[Math.floor(Math.random() * classes.length)],
    gpa: randomGpa(),
  }
})