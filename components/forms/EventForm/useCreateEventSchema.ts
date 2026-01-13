import * as yup from "yup";
import { useTranslations } from "next-intl";
import { EventLevel, EventType } from "@/lib/supabase/types";
import { CreateEventFormData } from "@/components/pages/CreateEventPage/CreateEventPage";

export const useCreateEventSchema = () => {
  const t = useTranslations();

  // TODO check if field names translated properly
  return yup.object({
    title: yup
      .string()
      .required(
        t("validation.required", { field: t("create_event.form.title") })
      )
      .min(
        3,
        t("validation.minLength", {
          field: t("create_event.form.title"),
          count: 3,
        })
      ),

    description: yup
      .string()
      .required(
        t("validation.required", { field: t("create_event.form.description") })
      )
      .min(
        10,
        t("validation.minLength", {
          field: t("create_event.form.description"),
          count: 10,
        })
      ),

    location_id: yup
      .string()
      .required(
        t("validation.required", { field: t("create_event.form.location") })
      ),

    start_date: yup
      .string()
      .required(
        t("validation.required", { field: t("create_event.form.startDate") })
      ),

    end_date: yup
      .string()
      .required(
        t("validation.required", { field: t("create_event.form.endDate") })
      )
      .test(
        "is-after-start",
        t("validation.afterDate", {
          field: t("create_event.form.endDate"),
          after: t("create_event.form.startDate"),
        }),
        function (value) {
          const { start_date } = this.parent;
          if (!value || !start_date) return true;
          return new Date(value) > new Date(start_date);
        }
      ),

    level: yup
      .mixed<EventLevel>()
      .oneOf(
        [EventLevel.STREET, EventLevel.SEMI_PRO, EventLevel.PRO],
        t("validation.invalidOption")
      )
      .required(
        t("validation.required", { field: t("create_event.form.level") })
      ),

    type: yup
      .mixed<EventType>()
      .oneOf(
        [EventType.COMPETITION, EventType.EVENT, EventType.TRAINING],
        t("validation.invalidOption")
      )
      .required(
        t("validation.required", { field: t("create_event.form.type") })
      ),

    price: yup
      .number()
      .typeError(
        t("validation.mustBeNumber", { field: t("create_event.form.price") })
      )
      .required(
        t("validation.required", { field: t("create_event.form.price") })
      )
      .min(
        0,
        t("validation.positive", { field: t("create_event.form.price") })
      ),

    max_drivers: yup
      .number()
      .typeError(
        t("validation.mustBeNumber", {
          field: t("create_event.form.driversCount"),
        })
      )
      .required(
        t("validation.required", { field: t("create_event.form.driversCount") })
      )
      .integer(
        t("validation.mustBeInteger", {
          field: t("create_event.form.driversCount"),
        })
      )
      .min(
        1,
        t("validation.minValue", {
          field: t("create_event.form.driversCount"),
          count: 1,
        })
      ),

    image: yup
      .mixed<File>()
      .nullable()
      .defined()
      .test(
        "fileSize",
        t("validation.fileTooLarge", { max: "5MB" }),
        (file) => !file || file.size <= 5 * 1024 * 1024
      )
      .test(
        "fileType",
        t("validation.invalidFileType"),
        (file) => !file || file.type.startsWith("image/")
      ),
  });
};
