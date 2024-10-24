import styles from './ArticleData.module.scss';
import * as Icon from './icons';
import ArticleError from './ArticleError';
import { isValidDate } from '@helpers';
import dateFormat from 'dateformat';
import type { ReactNode, FC } from 'react';
import type { ArticleDataProps } from './ArticleData';

export default function ArticleDetails({ article }: ArticleDataProps) {
  const data = article?.data ?? {};
  const { publishDate, modifyDate, location, organization: org } = data;
  const publisher = org && org.length <= 35 ? org : article?.url.hostname;
  const hasDate = article && !article.isLoading && isValidDate(publishDate);
  const hasModifyDate = shouldShowModifyDate(publishDate, modifyDate);

  return !article || article.isLoading ? null : (
    <>
      {hasDate ? (
        <table className={styles.table}>
          <tbody>
            <DetailRow
              label="Publisher"
              value={publisher}
              valueIcon={Icon.Publisher}
            />
            <DetailRow
              label={hasModifyDate ? 'First posted' : 'Posted on'}
              value={publishDate}
              valueIcon={Icon.PublishDate}
              isDate
            />
            <DetailRow
              label="Last updated"
              value={modifyDate}
              valueIcon={Icon.ModifyDate}
              isHidden={!hasModifyDate}
              isDate
            />
            <DetailRow
              label={`${modifyDate ? 'Dates' : 'Date'} found in`}
              value={location}
              valueIcon={Icon.Location}
            />
          </tbody>
        </table>
      ) : (
        <ArticleError article={article} />
      )}
    </>
  );
}

function DetailRow({
  label,
  value,
  labelIcon: LabelIcon,
  valueIcon: ValueIcon,
  isDate,
  isHidden
}: DetailRowProps) {
  const labelIcon = typeof LabelIcon === 'function' ? <LabelIcon /> : LabelIcon;
  const valueIcon = typeof ValueIcon === 'function' ? <ValueIcon /> : ValueIcon;

  if ((isDate && typeof value === 'string') || value instanceof Date) {
    if (isValidDate(value)) {
      value = dateFormat(value, 'mmmm dS, yyyy');
    } else {
      isHidden = true;
    }
  }

  return !value || isHidden ? null : (
    <tr>
      <th scope="row">
        <span className={styles.detail}>
          {labelIcon} {label}
        </span>
      </th>
      <td>
        <span className={styles.detail}>
          <>
            <span className={styles.detailIcon}>{valueIcon}</span> {value}
          </>
        </span>
      </td>
    </tr>
  );
}

function shouldShowModifyDate(
  publishDate?: Nullable<string | Date>,
  modifyDate?: Nullable<string | Date>
) {
  if (
    !publishDate ||
    !modifyDate ||
    !isValidDate(publishDate) ||
    !isValidDate(modifyDate)
  ) {
    return false;
  }

  publishDate = new Date(publishDate);
  modifyDate = new Date(modifyDate);

  if (
    dateFormat(publishDate, 'mmmm dS, yyyy') ===
    dateFormat(modifyDate, 'mmmm dS, yyyy')
  ) {
    return false;
  }

  const diffTime = Math.abs(modifyDate.getTime() - publishDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 1;
}

type DetailRowProps = {
  label: ReactNode;
  labelIcon?: ReactNode | FC;
  value?: ReactNode | Date;
  valueIcon?: ReactNode | FC;
  isDate?: boolean;
  isHidden?: boolean;
};
