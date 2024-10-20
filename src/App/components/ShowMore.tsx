import { useTranslation } from "react-i18next";

import ShowMoreText, { ReactShowMoreTextProps } from "react-show-more-text";

interface ShowMoreProps extends ReactShowMoreTextProps {}

const ShowMore = ({ children, ...props }: ShowMoreProps) => {
  const { t } = useTranslation();

  return (
    <ShowMoreText
      lines={1}
      width={100}
      more={t("show-more.more-label")}
      less={t("show-more.less-label")}
      {...props}
    >
      {children}
    </ShowMoreText>
  );
};

export default ShowMore;
