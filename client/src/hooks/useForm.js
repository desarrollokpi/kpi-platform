import { useState, useCallback, useMemo, useEffect, useRef } from "react";

const shallowEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
};

const useForm = (initialState = {}, options = {}) => {
  const { allowEmpty } = options;

  const [fields, setFormFields] = useState(initialState);
  const prevInitialRef = useRef(initialState);

  useEffect(() => {
    // Only reset when initialState actually changes (shallow compare)
    if (!shallowEqual(prevInitialRef.current || {}, initialState || {})) {
      setFormFields(initialState || {});
      prevInitialRef.current = initialState;
    }
  }, [initialState]);

  const onChange = useCallback((event) => {
    const { name, type, value, checked } = event.target;

    setFormFields((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const setFields = useCallback((nextFields) => {
    setFormFields(nextFields || {});
  }, []);

  const isFieldAllowedEmpty = useCallback(
    (name, value, allFields) => {
      if (!allowEmpty) return false;

      if (Array.isArray(allowEmpty)) {
        return allowEmpty.includes(name);
      }

      if (typeof allowEmpty === "function") {
        return allowEmpty(name, value, allFields);
      }

      return false;
    },
    [allowEmpty]
  );

  const missingRequiredFields = useMemo(() => {
    if (!fields || typeof fields !== "object") return [];

    const missing = [];

    Object.entries(fields).forEach(([name, fieldValue]) => {
      if (isFieldAllowedEmpty(name, fieldValue, fields)) {
        return;
      }

      if (fieldValue == null) {
        missing.push(name);
        return;
      }

      if (typeof fieldValue === "string") {
        if (fieldValue.trim() === "") {
          missing.push(name);
        }
        return;
      }

      if (Array.isArray(fieldValue)) {
        if (fieldValue.length === 0) {
          missing.push(name);
        }
        return;
      }
    });

    return missing;
  }, [fields, isFieldAllowedEmpty]);

  const areFieldsEmpty = useMemo(() => missingRequiredFields.length > 0, [missingRequiredFields]);

  const bindField = useCallback(
    (name) => ({
      name,
      onChange,
      value: fields?.[name] ?? "",
    }),
    [fields, onChange]
  );

  // Return missingRequiredFields as the 5th item so callers that need
  // more granular feedback can use it without breaking existing usage.
  return [fields, bindField, areFieldsEmpty, setFields, missingRequiredFields];
};

export default useForm;
