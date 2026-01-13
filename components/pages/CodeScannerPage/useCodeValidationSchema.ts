import { useTranslations } from "next-intl";
import * as yup from "yup";

export const useCodeValidationSchema = () => {
  const t = useTranslations();

  return yup.object({
    code: yup
      .string()
      .required(t("validation.required", { field: t("scanner.codeField") }))
      .matches(/^\d{6}$/, t("validation.codeLength"))
      .test("range", t("validation.codeRange"), (val) => {
        const num = parseInt(val || "0", 10);
        return num >= 100000 && num <= 999999;
      }),
  });
};
