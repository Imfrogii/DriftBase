import { getLocale } from "next-intl/server";
import Link from "next/link";
import styles from "./Pagination.module.scss";
import classnames from "classnames";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default async function Pagination({
  params,
  totalPages,
  pageUrl,
}: {
  params: string;
  totalPages: number;
  pageUrl?: string;
}) {
  const paramsInitial = new URLSearchParams(params);
  const currentPage = Number(paramsInitial.get("page")) || 1;
  const locale = await getLocale();
  const baseUrl = pageUrl || `/${locale}/events`;

  const getHref = (page: number) => {
    const newParams = new URLSearchParams(params);
    if (page === 1) {
      newParams.delete("page");
    } else {
      newParams.set("page", page.toString());
    }
    const query = newParams.toString();
    return `${baseUrl}${query ? `?${query}` : ""}`;
  };

  const buildPages = (
    currentPage: number,
    totalPages: number,
    maxVisible: number = 7
  ): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];

    // Всегда добавляем первую страницу
    pages.push(1);

    const remainingSlots = maxVisible - 2; // 1 (начало) + 1 (конец)
    let start = Math.max(2, currentPage - Math.floor(remainingSlots / 2));
    let end = Math.min(
      totalPages - 1,
      currentPage + Math.floor(remainingSlots / 2)
    );

    // Корректируем сдвиг, если возле границ
    if (start <= 2) {
      start = 2;
      end = start + remainingSlots - 1;
    }
    if (end >= totalPages - 1) {
      end = totalPages - 1;
      start = Math.max(2, end - (remainingSlots - 1));
    }

    if (start > 2) {
      pages.push("ellipsis");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("ellipsis");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={styles.pagination}>
      {
        currentPage > 1 && (
          <Link
            href={getHref(currentPage - 1)}
            className={styles.page}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Link>
        )
        // : (
        //   <div className={classnames(styles.page, styles.hidden)} />
        // )
      }
      {buildPages(currentPage, totalPages).map((page, index) =>
        page === "ellipsis" ? (
          <span className={styles.ellipsis} key={`ellipsis-${index}`}>
            …
          </span>
        ) : (
          <Link
            href={getHref(page)}
            key={page}
            className={classnames(styles.page, {
              [styles.active]: currentPage === page,
            })}
          >
            {page}
          </Link>
        )
      )}
      {currentPage !== totalPages ? (
        <Link
          href={getHref(currentPage + 1)}
          className={styles.page}
          //   TODO
          aria-label="Next page"
        >
          <ChevronRight />
        </Link>
      ) : (
        <div className={classnames(styles.page, styles.hidden)} />
      )}
    </div>
  );
}
