export function required(value, fieldName = '此字段') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName}不能为空`;
  }
  return null;
}

export function minLength(value, min, fieldName = '此字段') {
  if (value && value.length < min) {
    return `${fieldName}至少需要${min}个字符`;
  }
  return null;
}

export function maxLength(value, max, fieldName = '此字段') {
  if (value && value.length > max) {
    return `${fieldName}不能超过${max}个字符`;
  }
  return null;
}

export function email(value) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value && !regex.test(value)) {
    return '请输入有效的邮箱地址';
  }
  return null;
}

export function validateForm(validations) {
  const errors = {};
  let isValid = true;
  
  for (const [field, rules] of Object.entries(validations)) {
    for (const rule of rules) {
      const error = rule();
      if (error) {
        errors[field] = error;
        isValid = false;
        break;
      }
    }
  }
  
  return { isValid, errors };
}
