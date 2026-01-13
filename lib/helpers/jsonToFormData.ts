export function jsonToFormData(
  json: any,
  formData = new FormData(),
  parentKey = ""
) {
  for (const key in json) {
    if (!json.hasOwnProperty(key)) continue;

    const value = json[key];
    const fullKey = parentKey ? `${parentKey}` : key;

    if (value instanceof File || value instanceof Blob) {
      formData.append(fullKey, value);
    } else if (typeof value === "object" && value !== null) {
      formData.append(fullKey, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(fullKey, value);
    }
  }
  return formData;
}
