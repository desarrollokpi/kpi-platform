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

  const areFieldsEmpty = useMemo(() => {
    if (!fields || typeof fields !== "object") return true;

    return Object.entries(fields).some(([name, fieldValue]) => {
      if (isFieldAllowedEmpty(name, fieldValue, fields)) {
        return false;
      }

      if (fieldValue == null) return true;

      if (typeof fieldValue === "string") {
        return fieldValue.trim() === "";
      }

      if (Array.isArray(fieldValue)) {
        return fieldValue.length === 0;
      }

      return false;
    });
  }, [fields, isFieldAllowedEmpty]);

  const bindField = useCallback(
    (name) => ({
      name,
      onChange,
      value: fields?.[name] ?? "",
    }),
    [fields, onChange]
  );

  return [fields, bindField, areFieldsEmpty, setFields];
};

export default useForm;
