export const generateSlug = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    // Заменяем последовательности пробелов на один дефис
    .replace(/\s+/g, "-")
    // Убираем запрещённые символы, оставляя буквы (Unicode), цифры, дефисы и подчёркивания
    .replace(/[^\p{L}\p{N}\-_]+/gu, "")
    .replace(/-+/g, "-");
