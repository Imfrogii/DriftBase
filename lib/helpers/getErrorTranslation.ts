import { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const getErrorTranslation = (
  t: TFunction,
  code: string,
  context?: string
): string => {
  if (context) {
    const contextualKey = `errorCodes.${context}.${code}`;
    const contextualMessage = t(contextualKey);

    // Если перевод для контекстного ключа не найден — next-intl вернёт сам ключ
    // Мы проверяем, отличается ли он от исходного ключа
    if (contextualMessage !== contextualKey) {
      return contextualMessage;
    }
  }

  // Fallback на общий код
  return t(`errorCodes.${code}`);
};
