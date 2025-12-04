import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface FormErrors {
  [key: string]: string;
}

export function useFormValidation(initialValues: Record<string, unknown>, rules: ValidationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((fieldName: string, value: unknown) => {
    const fieldRules = rules[fieldName];
    if (!fieldRules) return '';

    for (const rule of fieldRules) {
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return rule.message;
      }

      if (typeof value === 'string' && value) {
        if (rule.minLength && value.length < rule.minLength) {
          return rule.message;
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          return rule.message;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          return rule.message;
        }
      }

      if (rule.custom && !rule.custom(value)) {
        return rule.message;
      }
    }
    return '';
  }, [rules]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, [validateField]);

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, values, validateField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    reset,
    setValues,
  };
}
